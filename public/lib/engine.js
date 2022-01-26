ChronoUtils.tick();
class Engine {
	constructor(config, forceDebug) {
		ChronoUtils.tick();
		/* Prototypes */
		this.setupPrototypes();
		/* Setup stylesheet emoji cursors. */
		this.setupEmojiCursors();
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
		this.collisionBoxCalculator = new CollisionBoxCalculator(this.directData);


		this.imageLoader = new ImageLoader({
			"assets/mouse-cursor.png": true,
			"assets/pointer-cursor.png": true,
			"assets/button_e.png": true,
			"assets/button_q.png": true,
		});
		this.uiComponents = [];

		if (this.debug) {
			new FpsBox(this);
		}
		this.playerOverlay = new PlayerOverlay(this);
		new DragDrop(this);

		this.refresher = new Set();
		this.updater = new Set();

		this.music = new Music(this);
		this.voiceManager = new VoiceManager();
		this.soundManager = new SoundManager();

		this.init(config);

		this.keyboardHandler = new KeyboardHandler(document);
		this.refreshPerFrame = 1;

		this.sidebars = [
			{
				name: "main menu",
				game: "Menu",
				onClick: engine => {
					confirmRestart();
				},
				hideSidebar: (engine) => {
					return engine.countUnlocked() === 1;
				},
			},
			{
				name: "entrance",
				game: "Entrance",
				disabled: (engine) => {
					return !["Menu", "Entrance", "Restroom", "Lobby"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "restroom",
				game: "Restroom",
				disabled: (engine) => {
					return !["Menu", "Entrance", "Restroom", "Lobby"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "lobby",
				game: "Lobby",
				disabled: (engine) => {
					return !["Menu", "Entrance", "Restroom", "Lobby"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "first room",
				game: "LockedRoom",
				disabled: (engine) => {
					return !["Menu", "Entrance", "Restroom", "Lobby"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "joker",
				game: "JokerRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "time",
				game: "TimeRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "animal",
				game: "AnimalRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "gandalf",
				game: "GandalfRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "math",
				game: "MathRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "restaurant",
				game: "Restaurant",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "music",
				game: "SoundRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "no clue",
				game: "ClueRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "desert",
				game: "DesertRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "batman",
				game: "BatmanRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "computer",
				game: "ComputerRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "impossible",
				game: "ImpossibleRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneTag);
				},
			},
		];
		this.score = parseInt(localStorage.getItem("bestScore")) || 0;
		this.shift = {
			x:0, y:0, z:0, zoom:1, opacity: 1,
			rotation:[0,0,0],
			goal:{
				x:0, y:0, z:0,
				zoom:1, opacity: 1, rotation:[0,0,0],
			},
			speed: dist => dist / 20,
			canvasWidth: 0, canvasHeight: 0,
			dirty: true,
		};
		this.tempVec3 = vec3.create();
	}

	addUiComponent(component) {
		this.uiComponents.push(component);
	}

	restoreUIComponents() {
		this.uiComponents.filter(({onRefresh}) => onRefresh).forEach(component => this.refresher.add(component));
	}

	countUnlocked() {
		let count = 0;
		this.sidebars.forEach(({ game, name, disabled, hideSidebar }, index) => {
			if (this.roomUnlocked(game)) {
				count++;
			}
		});
		return count;
	}

	getLevelFor(name) {
		for (let i = 0; i < this.sidebars.length; i++) {
			if (this.sidebars[i].game === name) {
				return i;
			}
		}
		return -1;
	}

	roomUnlocked(game) {
		return localStorage.getItem(game + "-unlocked");
	}

	enableSidebar(enabled) {
		const sidebar = document.getElementById("sidebar");
		if (enabled) {
			sidebar.classList.remove("blocked");
		} else {
			sidebar.classList.add("blocked");
		}
	}

	updateSidebar(selected, joker) {
		const sidebar = document.getElementById("sidebar");
		sidebar.innerText = "";
		let foundSelected = false;
		let doHideSidebar = false;
		const allRows = [];
		this.sidebars.forEach(({ game, name, disabled, hideSidebar, onClick }, index) => {
			const classObj = nameToClass(game);
			const row = sidebar.appendChild(document.createElement("div"));
			allRows.push(row);
			row.classList.add("sidebar-room");
			const icon = joker === game ? " 🤪" : index && index <= this.score ? " ✔️" : "";
			row.innerText = `${name}${icon}`;
			if (!this.roomUnlocked(game)) {
				row.classList.add("locked");
			} else if (selected !== game && disabled && disabled(this)) {
				row.classList.add("disabled");
			} else {
				if (selected !== game) {
					row.addEventListener("click", () => {
						if (onClick) {
							onClick(this);
						} else {
							allRows.forEach(row => {
								row.classList.remove("selected");
								row.classList.add("wait");
							});
							row.classList.add("selected");
							this.setGame(new classObj()).then(() => {
								allRows.forEach(row => row.classList.remove("wait"));
							});
						}
					});
				}
			}

			if (selected === game) {
				row.classList.add("selected");
				foundSelected = true;
				if (hideSidebar && hideSidebar(this)) {
					doHideSidebar = true;
				}
			}
		});
		sidebar.style.display = !doHideSidebar && foundSelected ? "flex" : "none";
	}

	setRefreshPerFrame(value) {
		this.refreshPerFrame = value;
	}

	setupEmojiCursors() {
		this.sheet = (() => {
			const style = document.createElement("style");
			style.appendChild(document.createTextNode(""));
			document.head.appendChild(style);
			return style.sheet;
		})();
		this.iconEmojis = {};
		this.addEmojiRule("happy", "😀");
	}

	addEmojiRule(id, emoji) {
		if (!this.iconEmojis[id]) {
			this.iconEmojis[id] = true;
			this.sheet.insertRule(`#overlay.cursor-${id} { cursor:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'  width='32' height='32' viewport='0 0 64 64' style='fill-opacity:0.4;stroke:white;fill:white;font-size:18px;'><circle cx='50%' cy='50%' r='10'/><line x1='16' y1='0' x2='8' y2='10' style='stroke:rgb(255,255,255);stroke-width:1' /><line x1='16' y1='0' x2='24' y2='10' style='stroke:rgb(255,255,255);stroke-width:1' /><text x='8' y='24'>${emoji}</text></svg>") 16 0,auto; }`,
				this.sheet.rules.length);
			this.sheet.insertRule(`#overlay.cursor-${id}.highlight { cursor:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'  width='32' height='32' viewport='0 0 64 64' style='fill-opacity:0.4;stroke:yellow;fill:yellow;font-size:18px;stroke-width:3'><circle cx='50%' cy='50%' r='10'/><line x1='16' y1='0' x2='8' y2='10' style='stroke:rgb(255,255,0);stroke-width:3' /><line x1='16' y1='0' x2='24' y2='10' style='stroke:rgb(255,255,0);stroke-width:3' /><text x='8' y='24'>${emoji}</text></svg>") 16 0,auto; }`,
				this.sheet.rules.length);
		}
	}

	setCursor(id, highlight) {
		if (this.cursorId === id && this.cursorHighlight === highlight) {
			return;
		}
		this.cursorId = id;
		this.cursorHighlight = highlight;
		const classList = this.overlay.classList;
		for (let i = 0; i < classList.length; i++) {
			const c = classList[i];
			if (c.startsWith("cursor-")) {
				classList.remove(classList[i]);
			}
		}
		if (id) {
			classList.add(`cursor-${id}`);
		}
		if (highlight) {
			classList.add('highlight');
		} else {
			classList.remove('highlight');
		}
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

		const {viewport: {size: [viewportWidth, viewportHeight]}} = config;

		ChronoUtils.tick();
		console.log("Config", config);
		const maxInstancesCount = config.maxInstancesCount || 1000;
		await this.loadDomContent(document);
		console.log("Starting engine...");
		const canvas = document.getElementById("canvas");
		this.mouseHandlerManager = new MouseHandlerManager(document, canvas);

		if (!canvas) {
			console.error("You need a canvas with id 'canvas'.");
		}
		ChronoUtils.tick();
		this.canvas = canvas;
		const gl = canvas.getContext("webgl", config.webgl) || canvas.getContext("experimental-webgl", config.webgl);
		this.gl = gl;
		await this.collisionBoxCalculator.init();

		this.tipBox = new TipBox(this);

		this.overlay = document.getElementById("overlay");

		/* Focus Fixer */
		this.focusFixer = new FocusFixer(canvas);	

		if (!gl.getExtension('OES_element_index_uint')) {
			throw new Error("OES_element_index_uint not available.");
		}
		const ext = gl.getExtension('ANGLE_instanced_arrays');
		if (!ext) {
			throw new Error('need ANGLE_instanced_arrays.');
		}
		this.ext = ext;

		/* Config shader */
		this.configShader(gl, config);

		/* Initialize Shader program */
		const { vertexShader, fragmentShader, attributes } = globalData;
		this.shaders = [
			new Shader(0, gl, ext, vertexShader, fragmentShader, attributes, maxInstancesCount),
		];

		/* Texture management */
		this.shaders[0].link();
		this.shaders[0].use();
		this.textureManager = new TextureManager(gl, this.shaders[0].uniforms, this.collisionBoxCalculator);

		/* Buffer renderer */
		this.bufferRenderer = new BufferRenderer(gl, config);
		this.spriteRenderer = new SpriteRenderer(this.bufferRenderer, this.shaders[0], this.config.viewport.size);

		/* Load sprite */
		this.spriteCollection = new SpriteCollection(this, this.refresher);
		this.urlToTextureIndex = {};

		/* Setup game tab. */
		if (this.debug) {
			const gameTab = document.getElementById("game-tab");
			this.sceneTab = new SceneTab(this, globalFiles, gameTab);
			await this.sceneTab.init();
		}
		ChronoUtils.tick();

		await this.setupGameName(globalFiles);

		/* Setup constants */
		// this.numInstances = 30;	//	Note: This shouldn't be constants. This is the number of instances.
		// console.log("numInstances", 30);
		this.numVerticesPerInstance = 6;
		engine.canvas.style.opacity = 1;
		this.initialize(gl, this.shaders[0]);

		await this.voiceManager.init();
		ChronoUtils.tick();

		this.lastTime = 0;
		this.time = 0;
		await this.initGame(this.game);
		ChronoUtils.tick();

		this.textureManager.generateAllMipMaps();

		this.uiComponents.forEach(component => component.init());

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

	async changeCursor(cursor, cantWait) {
		if (this.overlay && this.overlay.style.cursor !== cursor) {
			this.overlay.style.cursor = cursor;
			if (!cantWait) {
				await this.wait(500);
			}
		}
	}

	async setGame(game, skipCursor) {
		this.shift.goal.light = 0;
		this.shift.light = 0;
		if (!skipCursor) {
			await this.changeCursor("wait");
		}
		await this.resetScene();
		this.restoreUIComponents();

		this.game = game;
		if (this.ready) {
			await this.initGame(this.game);
		}
		return game;
	}

	async adjustWindowSize(game) {
		const {windowSize: [windowWidth, windowHeight], viewportSize: [viewportWidth, viewportHeight], margin} = await game.getSettings(this);
		document.body.style.width = `${windowWidth}px`;
		document.body.style.height = `${windowHeight}px`;
		this.canvas.style.left = margin?.left ? `${margin?.left}px` : `${(windowWidth - viewportWidth) / 2}px`;
		this.canvas.style.top = margin?.top ? `${margin?.top}px` : `${(windowHeight - viewportHeight) / 2}px`;
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
		await this.adjustWindowSize(game);
		await this.adjustRefresh(game);

		this.updateSidebar(game.sceneTag, localStorage.getItem("joker"));
		await game.init(this, this.classToGame[game.sceneTag]);
		this.shift.goal.light = 1;
		await game.postInit();

		const sprites = this.spriteCollection.sprites;
		for (let i = 0; i < game.physics.length; i++) {
			await game.physics[i].init(sprites, game);
		}
		ChronoUtils.tick();

		if (this.sceneTab) {
			this.sceneTab.setScene(game);
		}

		ChronoUtils.tick();
		ChronoUtils.log();
		if (this.game.handleMouse) {
			this.mouseHandlerManager.add(this.game);
		}
		this.spriteCollection.spritesFilteredBy("handleMouse").forEach(sprite => this.mouseHandlerManager.add(sprite));
		this.spriteCollection.spritesFilteredBy("needsMouse").forEach(sprite => this.mouseHandlerManager.add(sprite));
		this.setupDragListeners();
		game.ready = Math.max(this.lastTime, 1);
	}

	setupDragListeners() {
		if (this.game.onDropOnOverlay) {
			this.overlay.addEventListener("drop", this.onDropOnOverlay);
		}
		if (this.game.onDragOver) {
			this.overlay.addEventListener("dragover", this.onDragOver);
		}
	}

	removeDragListeners() {
		if (this.overlay) {
			this.overlay.removeEventListener("drop", this.onDropOnOverlay);
			this.overlay.removeEventListener("dragover", this.onDragOver);
		}
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
		this.shift.x = 0;
		this.shift.y = 0;
		this.shift.z = 0;
		this.shift.rotation[0] = 0;
		this.shift.rotation[1] = 0;
		this.shift.rotation[2] = 0;
		this.shift.light = 0;
		this.shift.zoom = 1;
		this.shift.goal.x = 0;
		this.shift.goal.y = 0;
		this.shift.goal.z = 0;
		this.shift.goal.zoom = 1;
		this.shift.goal.light = 0;
		this.shift.goal.rotation[0] = 0;
		this.shift.goal.rotation[1] = 0;
		this.shift.goal.rotation[2] = 0;
		this.shift.dirty = true;
		this.removeDragListeners();
		this.removeKeyboardListeners();
		this.mouseHandlerManager.clear();
	}

	resetGame() {
		this.data = {};
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

	initialize(gl, shader) {
		const uniforms = shader.uniforms;
		this.bufferRenderer.setAttribute(shader.attributes.vertexPosition, 0, Utils.FULL_VERTICES);		
		gl.clearColor(.0, .0, .1, 1);

		this.viewMatrix = mat4.fromRotationTranslation(mat4.create(), quat.fromEuler(quat.create(), -90, 0, 0), vec3.set(this.tempVec3, 0, 0, 0));
		gl.uniformMatrix4fv(uniforms.view.location, false, this.viewMatrix);
		gl.uniformMatrix4fv(uniforms.hudView.location, false, mat4.fromTranslation(mat4.create(), vec3.set(this.tempVec3, 0, 0, 0)));

		this.setClamp(0, 0, 0, 0, 0, 0);
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
		const { canvas, gl } = this;
		if (this.viewportWidth !== viewportWidth 
			|| this.viewportHeight !== viewportHeight
			|| this.pixelScale !== pixelScale) {
			canvas.style.width = `${viewportWidth}px`;
			canvas.style.height = `${viewportHeight}px`;
			const newPixelScale = pixelScale || (this.isRetinaDisplay() ? .5 : 1);
			const pixelScaleMultiplier = 1 / newPixelScale;
			canvas.width = viewportWidth * pixelScaleMultiplier;
			canvas.height = viewportHeight * pixelScaleMultiplier;
	  		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	  		this.setProjectionMatrices(this.config.viewAngle, pixelScale);
			this.viewportWidth = viewportWidth;
			this.viewportHeight = viewportHeight;
			this.pixelScale = pixelScale;
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

	doCollide(box1, box2, time) {
		if (!box1 || !box2) {
			return false;
		}
		return box1.right >= box2.left && box2.right >= box1.left && box1.bottom >= box2.top && box2.bottom >= box1.top;
	}

	handleOnRefreshes(time, dt, actualTime) {
		for (let item of this.refresher) {
			if (item.onRefresh) {
				item.onRefresh(item, time, dt, actualTime);
			}
		}
	}

	onDropOnOverlay(event) {
		if (this.game && this.game.onDropOnOverlay) {
			this.game.onDropOnOverlay(event);
		}
	}

	onDragOver(event) {
		if (this.game && this.game.onDragOver) {
			this.game.onDragOver(event);
		}
	}

	gamePaused() {
		return this.game.paused || !this.focusFixer.focused;
	}

	refresh(time, actualTime, render, skipUpdateView) {
		this.time = time;
		const dt = time - this.lastTime;
		const game = this.game;
		if (game.ready) {
			if (this.gamePaused()) {
				return;
			}
			for (let i = 0; i < game.physics.length; i++) {
				game.physics[i].refresh(time, dt);
			}

			game.refresh(time, dt);
		}
		this.handleOnRefreshes(time, dt, actualTime);
		if (!skipUpdateView) {
			this.handleViewUpdate(time, this.shaders[0], render);
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

	handleViewUpdate(time, shader, render) {
		let shiftChanged = false;
		const shift = this.shift;
		if (shift.x !== shift.goal.x
			|| shift.y !== shift.goal.y
			|| shift.z !== shift.goal.z
			|| shift.zoom !== shift.goal.zoom
			|| shift.light !== shift.goal.light
			|| shift.rotation[0] !== shift.goal.rotation[0]
			|| shift.rotation[1] !== shift.goal.rotation[1]
			|| shift.rotation[2] !== shift.goal.rotation[2]
			|| shift.dirty) {
			const dx = (shift.goal.x - shift.x);
			const dy = (shift.goal.y - shift.y);
			const dz = (shift.goal.z - shift.z);
			const drx = (shift.goal.rotation[0] - shift.rotation[0]);
			const dry = (shift.goal.rotation[1] - shift.rotation[1]);
			const drz = (shift.goal.rotation[2] - shift.rotation[2]);
			const dzoom = (shift.goal.zoom - shift.zoom);
			const dlight = (shift.goal.light - shift.light);
			const dist = Math.sqrt(dx*dx + dy*dy + dz*dz + drx*drx + dry*dry + drz*drz + dzoom*dzoom + dlight*dlight);
			const speed = shift.speed(dist);
			const mul = dist < .1 ? 1 : Math.min(speed, dist) / dist;
			shift.x += dx * mul;
			shift.y += dy * mul;
			shift.z += dz * mul;
			shift.rotation[0] += drx * mul;
			shift.rotation[1] += dry * mul;
			shift.rotation[2] += drz * mul;
			shift.zoom += dzoom * mul;
			shift.light += dlight * mul;
			shift.dirty = false;
			shiftChanged = true;
		}

		const uniforms = shader.uniforms;
		let shakeX = 0, shakeY = 0;
		const shake = typeof(this.shake) === "function" ? this.shake(time) : this.shake;
		if (shake) {
			if (shake > 1) {
				shakeY = (Math.random() - .5) * shake;
			}
		} else if (shake === null && this.shake) {
			delete this.shake;
			shiftChanged = true;
		}

		if (render) {
			if (shiftChanged || shakeX || shakeY) {
				const gl = this.gl;
				mat4.identity(this.viewMatrix);
				const coef = shift.zoom;
				const coef2 = coef * coef;
				mat4.scale(this.viewMatrix, this.viewMatrix, vec3.set(this.tempVec3, coef, coef, 1));
				mat4.rotateX(this.viewMatrix, this.viewMatrix, shift.rotation[0] * Constants.DEG_TO_RAD);
				mat4.rotateY(this.viewMatrix, this.viewMatrix, shift.rotation[1] * Constants.DEG_TO_RAD);
				mat4.rotateZ(this.viewMatrix, this.viewMatrix, shift.rotation[2] * Constants.DEG_TO_RAD);
				mat4.translate(this.viewMatrix, this.viewMatrix, vec3.set(this.tempVec3, shift.x * coef2 + shakeX, -shift.y * coef2 + shakeY, -shift.z * coef2));
				gl.uniformMatrix4fv(uniforms.view.location, false, this.viewMatrix);
				gl.uniform1f(uniforms.globalLight.location, shift.light);

				mat4.identity(this.viewMatrix);
				mat4.rotateX(this.viewMatrix, this.viewMatrix, -shift.rotation[0] * Constants.DEG_TO_RAD);
				mat4.rotateY(this.viewMatrix, this.viewMatrix, -shift.rotation[1] * Constants.DEG_TO_RAD);
				mat4.rotateZ(this.viewMatrix, this.viewMatrix, -shift.rotation[2] * Constants.DEG_TO_RAD);
				gl.uniformMatrix4fv(uniforms.spriteMatrix.location, false, this.viewMatrix);
			}
		}
	}

	handleSpriteUpdate(updater) {
		for (let sprite of updater) {
			const spriteIndex = sprite.spriteIndex;
			if (sprite.updateFlag & Constants.RENDER_FLAG.SPRITE_ATTRIBUTE) {
				const {x, y, z, rotation, size:[width,height], anim:{hotspot}} = sprite;
				const hotX = hotspot[0] || 0;
				const hotY = hotspot[1] || 0;
				this.spriteRenderer.setAttributeSprite(spriteIndex, x, y, z, width, height, hotX, hotY, rotation);
			}
			if (sprite.updateFlag & Constants.RENDER_FLAG.TEXTURE) {
				const {anim, direction, active, opacity, light, spriteType } = sprite;
				this.spriteRenderer.setTextureIndex(spriteIndex, anim, active ? opacity : 0, light, spriteType);
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
		this.updateTime(time);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		this.ext.drawArraysInstancedANGLE(this.gl.TRIANGLES, 0, this.numVerticesPerInstance, this.spriteCollection.size());		
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
				this.updateSidebar(this.game.sceneTag, localStorage.getItem("joker"));
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

	static start(classObj, gameConfig, skipStartScreen, debug, configOverride) {
		const engine = new Engine(globalData.config, debug);
		engine.setGame(skipStartScreen ? new classObj(gameConfig, configOverride) : new StartScreen({classObj, gameConfig}, configOverride));
		window.engine = engine;
	}
}