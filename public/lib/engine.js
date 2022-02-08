class Engine {
	constructor(config, forceDebug) {
		/* Prototypes */
		this.setupPrototypes();
		/* Setup stylesheet emoji cursors. */
		this.cursorManager = new CursorManager(this);
		this.debug = (location.search.contains("release") ? false : forceDebug || location.search.contains("debug") || (location.host.startsWith("localhost:") || location.host.startsWith("dobuki.tplinkdns.com")));

		const fileUtils = this.fileUtils = new FileUtils();
		this.configMerger = new ConfigMerger(fileUtils, {
			hotspot_center: Constants.HOTSPOT_CENTER,
			hotspot_bottom: Constants.HOTSPOT_BOTTOM,
			horizontal_merge: Constants.HORIZONTAL_MERGE,
			vertical_merge: Constants.VERTICAL_MERGE,
			full_merge: Constants.FULL_MERGE,
			isDebug: this.debug ? 1 : 0,
		});
		this.directData = new DirectData({fileUtils});
		this.textureEdgeCalculator = new TextureEdgeCalculator(this.directData);


		this.imageLoader = new ImageLoader({
			"assets/button_e.png": true,
			"assets/button_q.png": true,
		});
		this.uiComponents = [];

		if (this.debug) {
			new FpsBox(this);
		}

		this.refresher = new Set();
		this.updater = new Set();

		this.music = new Music(this);
		this.soundManager = new SoundManager();

		this.init(config);

		this.keyboardHandler = new KeyboardHandler(document);
		this.refreshPerFrame = 1;

		this.score = parseInt(localStorage.getItem("bestScore")) || 0;
		this.shift = new Shift();

		this.core = {};

		this.gameChangeListener = new Set();
		this.coreChangeListener = new Set();

		this.isPerspective = null;
		this.backgroundColor = [0, 0, 0];

		window.addEventListener("resize", () => this.repositionCanvas());
	}

	async repositionCanvas() {
		const {windowSize: [windowWidth, windowHeight], viewportSize: [viewportWidth, viewportHeight], margin} = await this.game.getSettings(this);
		this.canvas.style.maxWidth = `${viewportWidth}px`;
		this.canvas.style.maxHeight = `${viewportHeight}px`;
		this.canvas.style.left = margin?.left ? `${margin?.left}px` : `${(Math.max(0, window.innerWidth - this.viewportWidth)) / 2}px`;
		this.canvas.style.top = margin?.top ? `${margin?.top}px` : `${(Math.max(0, window.innerHeight - this.viewportHeight)) / 2}px`;
	}

	addUiComponent(component) {
		this.uiComponents.push(component);
	}

	restoreUIComponents() {
		this.uiComponents.filter(({onRefresh}) => onRefresh).forEach(component => this.refresher.add(component));
	}

	setRefreshPerFrame(value) {
		this.refreshPerFrame = value;
	}

	loadDomContent(document) {
		if (document.readyState !== "loading") {
			return new Promise(resolve => resolve(document));
		}
		return new Promise(resolve => document.addEventListener("DOMContentLoaded", () => resolve(document)));
	}	

	isRetinaDisplay() {
        if (window.matchMedia) {
            var mq = window.matchMedia("only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)");
            return (mq && mq.matches || (window.devicePixelRatio > 1)); 
        }
    }

	async init(config) {
		this.config = config;

		console.log("Config", config);
		const maxInstancesCount = config.maxInstancesCount || 1000;
		await this.loadDomContent(document);
		console.log("Starting engine...");
		const canvas = document.getElementById("canvas");
		this.mouseHandlerManager = new MouseHandlerManager(document, canvas, engine);

		if (!canvas) {
			console.error("You need a canvas with id 'canvas'.");
		}
		this.canvas = canvas;
		const gl = canvas.getContext("webgl2", config.webgl);
		this.gl = gl;

		const renderer = gl.getParameter(gl.RENDERER);
		console.log("WebGL Renderer:", renderer);
		this.fakeGPU = renderer === "Google SwiftShader";

		await this.textureEdgeCalculator.init();

		this.tipBox = new TipBox(this);

		this.overlay = document.getElementById("overlay");

		/* Focus Fixer */
		this.focusFixer = new FocusFixer(canvas);	

		/* Config shader */
		this.configShader(gl, config);

		/* Initialize Shader program */
		const { vertexShader, fragmentShader, attributes } = globalData;
		this.shaders = [
			new Shader(0, this.gl, vertexShader, fragmentShader, attributes, maxInstancesCount),
		];

		/* Texture management */
		this.shaders[0].link();
		this.shaders[0].use();
		this.textureManager = new TextureManager(gl, this.shaders[0].uniforms.uTextures.location, this.textureEdgeCalculator);

		/* Renderer */
		this.spriteRenderer = new SpriteRenderer(this.gl, this.shaders[0].attributes);
		this.spriteRenderer.init();

		/* Load sprite */
		this.spriteCollection = new SpriteCollection(this, this.refresher);
		this.urlToTextureIndex = {};

		/* Setup game tab. */
		if (this.debug) {
			this.sceneTab = new SceneTab(this, globalFiles);
		}

		/* Setup game selector */
		if (this.debug) {
			this.selector = new GameStateSelector(this);
		}

		await this.setupGameName(globalFiles);

		/* Setup constants */
		this.numVerticesPerInstance = 6;
		engine.canvas.style.opacity = 1;

		this.lastTime = 0;
		this.time = 0;
		await this.initGame(this.game);

		this.textureManager.generateAllMipMaps();

		await Promise.all(this.uiComponents.map(component => component.init()));

		this.ready = true;
		Engine.turnOn(this);
	}

	async preloadAssets(onProgress) {
		return new Promise((resolve) => {
			globalFiles.forEach(({assets}) => {
				if (assets) {
					let totalCount = 0;
					let count = 0;
					assets.forEach(image => {
						const [ name, extension ] = image.split(".");
						if (extension !== "png" && extension !== "jpg") {
							return;
						}
						totalCount++;
						this.imageLoader.loadImage(`assets/${image}`)
							.then(img => {
								count++;
								if (onProgress) {
									onProgress(count, totalCount);
									if (count === totalCount) {
										resolve(totalCount);
									}
								}
							});
					});
				}
			});
		});
	}

	async setupGameName(globalFiles) {
		this.classToGame = {};
		globalFiles.forEach(({games, music}) => {
			if (games) {
				games.forEach(folder => {
					for (let dirName in folder) {
						if (Array.isArray(folder[dirName])) {
							const gameName = StringUtil.kebabToClass(dirName);

							folder[dirName].forEach(sceneFile => {
								if (typeof(sceneFile) !== "string") {
									return;
								}
								
								const [ scene, extension ] = sceneFile.split(".");
								const className = StringUtil.kebabToClass(scene);
								if (extension === "js") {
									this.classToGame[className] = gameName;									
								} else if (extension === "json") {
									this.classToGame[sceneFile] = gameName;
								}
							});
						}
					}
				});
			}
		});
	}

	async setGame(game, skipCursor) {
		this.shift.turnLight(0);
		if (!skipCursor) {
			await this.cursorManager.changeCursor("wait");
		}
		await this.resetScene();
		this.restoreUIComponents();

		const oldCoreName = this.game?.core?.name;
		const newCoreName = game.core?.name;
		if (oldCoreName && oldCoreName !== newCoreName) {
			//	exit core
			const oldCore = await this.getCore(oldCoreName);
			await oldCore.onExit(this);
		}

		this.game = game;
		if (this.ready) {
			await this.initGame(this.game);
		}
		for (let listener of this.gameChangeListener) {
			listener.onGameChange(game);
		}
		return game;
	}

	async adjustViewportSize(game) {
		const {viewportSize: [viewportWidth, viewportHeight], pixelScale } = await game.getSettings(this);
		this.resize(viewportWidth, viewportHeight, pixelScale||0);
	}

	async adjustRefresh(game) {
		const { refreshPerFrame } = await game.getSettings(this);
		this.setRefreshPerFrame(refreshPerFrame || 1);
	}

	async wait(ms) {
		return new Promise(resolve => {
			setTimeout(() => resolve(), ms);
		});
	}

	async initGame(game) {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		this.setClamp(0, 0, 0, 0, 0, 0);

		game.engine = this;
		localStorage.setItem(game.sceneTag + "-unlocked", new Date().getTime());

		await this.adjustViewportSize(game);
		await this.adjustRefresh(game);

		await game.init(this, this.classToGame[game.sceneTag]);
		this.shift.fadeLight(1);
		await game.postInit();

		const sprites = this.spriteCollection.sprites;
		for (let i = 0; i < game.physics.length; i++) {
			await game.physics[i].init(sprites, game);
		}

		if (this.sceneTab) {
			this.sceneTab.setScene(game);
		}

		if (this.game.handleMouse) {
			this.mouseHandlerManager.add(this.game);
		}
		this.spriteCollection.spritesFilteredBy("handleMouse").forEach(sprite => this.mouseHandlerManager.add(sprite));
		this.spriteCollection.spritesFilteredBy("needsMouse").forEach(sprite => this.mouseHandlerManager.add(sprite));
		game.ready = Math.max(this.lastTime, 1);
	}

	removeKeyboardListeners() {
		this.keyboardHandler.clearListeners();
	}

	async resetScene() {
		const { game, gl } = this;
		if (game) {
			game.ready = 0;
			for (let i = 0; i < this.spriteCollection.size(); i++) {
				const sprite = this.spriteCollection.get(i);
				sprite.onExit(game);
			}		

			for (let i = 0; i < game.physics.length; i++) {
				game.physics[i].onExit(game);
			}
			await game.onExit(engine);
			this.lastGame = game.constructor.name;
		}
		if (this.spriteCollection) {
			this.spriteCollection.clear();
		}
		if (this.textureManager) {
			this.textureManager.clear();
		}
		if (this.tipBox) {
			this.tipBox.clear();
		}
		if (this.refresher) {
			this.refresher.clear();
		}
		if (this.updater) {
			this.updater.clear();
		}
		this.setRefreshPerFrame(1);
		this.urlToTextureIndex = {};
		this.shift.clear();
		this.removeKeyboardListeners();
		this.mouseHandlerManager.clear();
		this.viewportWidth = null;
		this.viewportHeight = null;
	}

	resetGame(coreName) {
		const core = this.core[coreName];
		if (core) {
			core.reset();
		}
	}

	async getCore(coreName) {
		if (!this.core[coreName]) {
			const coreClass = nameToClass(`${coreName}Core`, true) || GameCore;
			this.core[coreName] = new coreClass(this, coreName);
			await this.core[coreName].init();
		}
		return this.core[coreName];
	}

	async addTexture(imageConfig) {
		const index = !imageConfig.url ? -1 : (this.urlToTextureIndex[imageConfig.url] ?? (this.urlToTextureIndex[imageConfig.url] = this.textureManager.nextTextureIndex++));
		return this.textureManager.createAtlas(index, this.imageLoader).setImage(imageConfig);
	}

	setupPrototypes() {
		String.prototype.contains = Array.prototype.contains = function(str) {
			return this.indexOf(str) >= 0;
		};
		Array.prototype.remove = function(str) {
			if (this.indexOf(str) >= 0) {
				this.splice(this.indexOf(str), 1);
			}
		};		
	}

	setProjectionMatrices(viewAngle, pixelScale) {
		const { gl, canvas } = this;
		const shader = this.shaders[0];
		const uniforms = shader.uniforms;
		const zNear = 0.01;
		const zFar = 5000;

		const fieldOfView = (viewAngle||45) * Constants.DEG_TO_RAD;   // in radians
		const aspect = gl.canvas.width / gl.canvas.height;
		const perspectiveMatrix = mat4.perspective(mat4.create(), fieldOfView, aspect, zNear, zFar);
		const pixelScaleMultiplier = 1 / (pixelScale || (this.isRetinaDisplay() ? .5 : 1));

		const viewportWidth = gl.drawingBufferWidth / pixelScaleMultiplier;
		const viewportHeight = gl.drawingBufferHeight / pixelScaleMultiplier;
		const orthoMatrix = mat4.ortho(mat4.create(), -viewportWidth, viewportWidth, -viewportHeight, viewportHeight, zNear, zFar);		
		gl.uniformMatrix4fv(uniforms.ortho.location, false, orthoMatrix);
		gl.uniformMatrix4fv(uniforms.perspective.location, false, perspectiveMatrix);
	}

	setPerspective(perspective) {
		if (this.isPerspective !== perspective) {
			this.isPerspective = perspective;

			new ValueRefresher(this, {
				start: perspective ? 0 : .001,
				end: perspective ? .001 : 0,
				duration: 300,
				callback: value => {
					const uniforms = this.shaders[0].uniforms;
					this.gl.uniform1f(uniforms.isPerspective.location, value === 1 ? 1 : value);
				},
			});
		}
	}

	changeBackgroundColor(color) {
		const finalColors = ColorUtils.hexToRgb(color);

		new ValueRefresher(this, {
			start: this.backgroundColor,
			end: finalColors,
			duration: 300,
			callback: (r, g, b) => {
				this.gl.clearColor(r / 255, g / 255, b / 255, 1);
			},
		});
		this.backgroundColor[0] = finalColors[0];
		this.backgroundColor[1] = finalColors[1];
		this.backgroundColor[2] = finalColors[2];
	}

	setClamp(minX, maxX, minY, maxY, minZ, maxZ) {
		const uniforms = this.shaders[0].uniforms;
		const clampMatrix = mat3.fromValues(
			maxX===minX ? -ArrayUtils.BIG_NUMBER / 2 : minX, (maxX-minX) || ArrayUtils.BIG_NUMBER, 0,
			maxY===minY ? -ArrayUtils.BIG_NUMBER / 2 : minY, (maxY-minY) || ArrayUtils.BIG_NUMBER, 0,
			maxZ===minZ ? -ArrayUtils.BIG_NUMBER / 2 : minZ, (maxZ-minZ) || ArrayUtils.BIG_NUMBER, 0);
		this.gl.uniformMatrix3fv(uniforms.clamp.location, false, clampMatrix);
	}

	configShader(gl, {webgl: {cullFace, depth}}) {
		switch(cullFace) {
			case "front":
				gl.enable(gl.CULL_FACE);
				gl.cullFace(gl.FRONT);
				break;
			case "back":
				gl.enable(gl.CULL_FACE);
				gl.cullFace(gl.BACK);
				break;
			default:
				gl.disable(gl.CULL_FACE);
		}
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		if (depth) {
			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LEQUAL);
		}
	}

	resize(viewportWidth, viewportHeight, pixelScale) {
		if (this.viewportWidth !== viewportWidth 
			|| this.viewportHeight !== viewportHeight
			|| this.pixelScale !== pixelScale) {
			const { canvas, gl, shift } = this;
			const uniforms = this.shaders[0].uniforms;

			const newPixelScale = pixelScale || (this.isRetinaDisplay() ? .5 : 1);
			const pixelScaleMultiplier = 1 / newPixelScale;
			canvas.width = viewportWidth * pixelScaleMultiplier;
			canvas.height = viewportHeight * pixelScaleMultiplier;
	  		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	  		this.setProjectionMatrices(this.config.viewAngle, pixelScale);
			this.viewportWidth = viewportWidth;
			this.viewportHeight = viewportHeight;
			this.pixelScale = pixelScale;
			gl.uniformMatrix4fv(uniforms.hudView.location, false, mat4.fromTranslation(mat4.create(), vec3.set(vec3.create(), -viewportWidth, viewportHeight, 0)));
			shift.setViewportSize(viewportWidth, viewportHeight);
			this.repositionCanvas();
		}
	}

	static turnOn(engine) {
		const frameDuration = 1000 / 60;
		let frame = 0;
		const loop = (time) => {
			const length = engine.refreshPerFrame;
			for (let i = 0; i < length; i++) {
				if (!engine.gamePaused()) {
					frame++;
				}
				engine.refresh(frame * frameDuration, time, i === length - 1);
			}
		  	requestAnimationFrame(loop);
		};
		loop(0);
	}

	handleOnRefreshes(time, dt, actualTime) {
		for (let item of this.refresher) {
			if (item.onRefresh) {
				item.onRefresh(time, dt, actualTime);
			}
		}
	}

	gamePaused() {
		return this.game.paused;// || !this.focusFixer.focused;
	}

	refresh(time, actualTime, render, skipUpdateView) {
		this.time = time;
		const dt = time - this.lastTime;
		const game = this.game;
		if (game.ready) {
			if (this.gamePaused()) {
				return;
			}
			for (let physic of game.physics) {
				physic.refresh(time, dt);
			}
			game.refresh(time, dt);
		}
		this.handleOnRefreshes(time, dt, actualTime);
		if (!skipUpdateView) {
			this.shift.handleViewUpdate(time, this.shaders[0], this.gl, render);
		}
		if (render) {
			this.handleSpriteUpdate(this.updater);
			this.render(time, dt);
		}
		this.lastTime = time;
	}

	forceRefresh() {
		this.refresh(this.lastTime, 0, true, true);
	}

	handleSpriteUpdate(updater) {
		for (let sprite of updater) {
			const spriteIndex = sprite.spriteIndex;
			if (sprite.updateFlag & Constants.RENDER_FLAG.SPRITE_ATTRIBUTE) {
				const {x, y, z, rotation, size:[width,height], anim, active, opacity} = sprite;
				const hotspot = anim?.hotspot || Constants.EMPTY_HOTSPOT;
				const hotX = hotspot[0];
				const hotY = hotspot[1];
				const visible = active && opacity > 0; 
				this.spriteRenderer.setAttributeSprite(spriteIndex, x, y, z, visible ? width : 0, visible ? height : 0, hotX, hotY, rotation);
			}
			if (sprite.updateFlag & Constants.RENDER_FLAG.TEXTURE) {
				const {anim, direction, opacity, light, spriteType } = sprite;
				this.spriteRenderer.setTextureIndex(spriteIndex, anim?.index, opacity, light, spriteType);
			}
			if (sprite.updateFlag & Constants.RENDER_FLAG.ANIMATION_INFO) {
				const {anim, direction, vdirection, } = sprite;
				this.spriteRenderer.setAnimationInfo(spriteIndex, anim, direction, vdirection);
			}
			if (sprite.updateFlag & Constants.RENDER_FLAG.MOTION) {
				const {motion, acceleration} = sprite;
				this.spriteRenderer.setMotion(spriteIndex, motion, acceleration);
			}
			if (sprite.updateFlag & Constants.RENDER_FLAG.UPDATE_TIME) {
				this.spriteRenderer.setUpdateTime(spriteIndex, sprite.getAnimationTime(), sprite.updated.motion);
			}
			sprite.updateFlag = 0;
		}
		updater.clear();
	}

	render(time, dt) {
		const gl = this.gl;
		this.updateTime(time);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.drawArraysInstanced(gl.TRIANGLES, 0, this.numVerticesPerInstance, this.spriteCollection.size());		
	}

	updateTime(time) {
		const uniforms = this.shaders[0].uniforms;
		this.gl.uniform1f(uniforms.timeInfo.location, time);		
	}

	postScore(score, callback) {
		if (score <= this.score) {
			return;
		}
		postScore(score, result => {
			if (result.success) {
				this.score = result.score.value;
				localStorage.setItem("bestScore", this.score);
			} else {
				console.log(result?.error?.message);
			}
			if (callback) {
				callback(score);
			}
		});
	}

	showMessage(id, message) {
		this.tipBox.showMessage(id, message);
	}

	clearMessage(id) {
		this.tipBox.clearMessage(id);
	}

	getMessage() {
		return this.tipBox.id;
	}

	delayAction(delay, callback, attacher) {
		const delayHandler = new Delay(this, delay, callback);
		if (attacher) {
			attacher.attachRefresher(delayHandler);
		}
	}

	repeatAction(interval, callback, attacher) {
		const intervalHandler = new Interval(this, interval, callback);
		if (attacher) {
			attacher.attachRefresher(intervalHandler);
		}		
	}

	static start(classObj, gameConfig, skipStartScreen, debug, configOverride) {
		const engine = new Engine(globalData.config, debug);
		engine.setGame(skipStartScreen ? new classObj(gameConfig, configOverride) : new StartScreen({classObj, gameConfig}, configOverride));
		window.engine = engine;
	}
}