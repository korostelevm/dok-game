class Engine {
	constructor(config) {
		/* Prototypes */
		this.setupPrototypes();
		/* Setup stylesheet emoji cursors. */
		this.setupEmojiCursors();

		this.debug = location.search.contains("release") ? false : location.search.contains("debug") || (location.host.startsWith("localhost:") || location.host.startsWith("dobuki.tplinkdns.com"));
		this.imageLoader = new ImageLoader();
		this.onPostRefresh = [];

		new FpsBox(this);
		new DebugView(this);


		this.init(config);

		this.seenGame = {};

		const gender = localStorage.getItem("playerGender") || "M";
		this.changeCharacter(gender === "W" ? "nuna" : gender === "T" ? "twin" : "monkor");

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
					return !["Menu", "Entrance", "Restroom", "Lobby"].includes(engine.game.sceneName);
				},
			},
			{
				name: "restroom",
				game: "Restroom",
				disabled: (engine) => {
					return !["Menu", "Entrance", "Restroom", "Lobby"].includes(engine.game.sceneName);
				},
			},
			{
				name: "lobby",
				game: "Lobby",
				disabled: (engine) => {
					return !["Menu", "Entrance", "Restroom", "Lobby"].includes(engine.game.sceneName);
				},
			},
			{
				name: "first room",
				game: "LockedRoom",
				disabled: (engine) => {
					return !["Menu", "Entrance", "Restroom", "Lobby"].includes(engine.game.sceneName);
				},
			},
			{
				name: "joker",
				game: "JokerRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneName);
				},
			},
			{
				name: "time",
				game: "TimeRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneName);
				},
			},
			{
				name: "animal",
				game: "AnimalRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneName);
				},
			},
			{
				name: "gandalf",
				game: "GandalfRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneName);
				},
			},
			{
				name: "math",
				game: "MathRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneName);
				},
			},
			{
				name: "restaurant",
				game: "Restaurant",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneName);
				},
			},
			{
				name: "music",
				game: "SoundRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneName);
				},
			},
			{
				name: "no clue",
				game: "ClueRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneName);
				},
			},
			{
				name: "desert",
				game: "DesertRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneName);
				},
			},
			{
				name: "batman",
				game: "BatmanRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneName);
				},
			},
			{
				name: "computer",
				game: "ComputerRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneName);
				},
			},
			{
				name: "impossible",
				game: "ImpossibleRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneName);
				},
			},
		];
		this.defaultVoiceReplacement = localStorage.getItem("defaultVoiceReplacement");
		this.score = parseInt(localStorage.getItem("bestScore")) || 0;
		this.shift = {x:0, y:0, zoom:1, opacity: 1, goal:{ x:0, y:0, zoom:1, opacity: 1 }, speed:dist => dist / 20, dirty: true};
	}

	addOnPostRefresh(component) {
		this.onPostRefresh.push(component);
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
			const classObj = eval(game);
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

	async loadDomContent(document) {
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

		if (config.viewport.pixelScale < 1 && !this.isRetinaDisplay()) {
			config.viewport.pixelScale = 1;
		}

		console.log(config);
		const maxInstancesCount = config.maxInstancesCount || 1000;
		console.log("maxInstancesCount", maxInstancesCount);
		await this.loadDomContent(document);
		console.log("Starting engine...");
		const canvas = document.getElementById("canvas");
		if (!canvas) {
			console.error("You need a canvas with id 'canvas'.");
		}
		// const writeCanvas = document.getElementById("write-canvas");
		// this.writeCanvas = writeCanvas;
		this.canvas = canvas;
		const gl = canvas.getContext("webgl", config.webgl) || canvas.getContext("experimental-webgl", config.webgl);
		this.gl = gl;

		this.tipBox = new TipBox(this.canvas);

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
		this.shader = new Shader(gl, ext, vertexShader, fragmentShader, attributes, maxInstancesCount);

		/* Texture management */
		this.textureManager = new TextureManager(gl, this.shader.uniforms);

		/* Load sprite */
		this.spriteCollection = new SpriteCollection(this);
		this.nextTextureIndex = 0;
		this.urlToTextureIndex = {};

		/* Buffer renderer */
		this.bufferRenderer = new BufferRenderer(gl, config);
		this.spriteRenderer = new SpriteRenderer(this.bufferRenderer, this.shader, this.config.viewport.size);

		/* Keyboard handler */
		this.keyboardHandler = new KeyboardHandler(document);

		this.setupMouseListeners();

		/* Setup game tab. */
		if (this.debug) {
			const gameTab = document.getElementById("game-tab");
			this.sceneTab = new SceneTab(this, globalFiles, gameTab);
		}

		await this.setupGameName(globalFiles);

		/* Setup constants */
		// this.numInstances = 30;	//	Note: This shouldn't be constants. This is the number of instances.
		// console.log("numInstances", 30);
		this.numVerticesPerInstance = 6;

		this.resize(canvas, gl, config);

		this.voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
		//console.log(this.voices);

		this.lastTime = 0;
		if (this.game) {
			await this.initGame(this.game);
		}

		this.textureManager.generateAllMipMaps();

		this.onPostRefresh.filter(component => component).forEach(component => component.init());

		this.ready = true;
		Engine.start(this);
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
		globalFiles.forEach(({games}) => {
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
								if (extension !== "js") {
									return;
								}
								const className = StringUtil.kebabToClass(scene);
								this.classToGame[className] = gameName;
							});
						}
					}
				});
			}
		});
	}

	async changeCursor(cursor) {
		if (this.overlay && this.overlay.style.cursor !== cursor) {
			this.overlay.style.cursor = cursor;
			await this.wait(500);
		}
	}

	async setGame(game, skipCursor) {
		this.shift.goal.opacity = 0;
		this.shift.opacity = 0;
		if (!skipCursor) {
			await this.changeCursor("wait");
		}
		this.resetScene();

		this.game = game;
		if (this.ready) {
			await this.initGame(this.game);
		}
		return game;
	}

	adjustWindowSize(game) {
		const [windowWidth, windowHeight] = game.getWindowSize();
		document.body.style.width = `${windowWidth}px`;
		document.body.style.height = `${windowHeight}px`;
		const {viewport: {pixelScale, size: [viewportWidth, viewportHeight]}} = this.config;
		this.canvas.style.left = `${(windowWidth - viewportWidth) / 2}px`;
	}

	async wait(ms) {
		return new Promise(resolve => {
			setTimeout(() => {
				resolve();
			}, ms);
		});
	}

	async initGame(game) {
		game.engine = this;
		localStorage.setItem(game.sceneName + "-unlocked", new Date().getTime());

		this.adjustWindowSize(game);		
		this.updateSidebar(game.sceneName, localStorage.getItem("joker"));
		await game.init(this, this.classToGame[game.sceneName]);
		await game.postInit();

		const sprites = game.engine.spriteCollection.sprites;
		for (let i = 0; i < game.physics.length; i++) {
			await game.physics[i].init(sprites, game);
		}

		game.ready = true;
		this.shift.goal.opacity = 1;
		if (this.sceneTab) {
			this.sceneTab.setScene(game);
		}
	}

	handleMouse(e) {
		if (this.game) {
			this.game.handleMouse(e);
		}
	}

	setupMouseListeners() {
		document.addEventListener("click", e => {
			this.handleMouse(e);
		});
		document.addEventListener("mousedown", e => {
			this.handleMouse(e);
		});
		document.addEventListener("mousemove", e => {
			this.handleMouse(e);
		});
		document.addEventListener("mouseup", e => {
			this.handleMouse(e);
		});
	}

	resetScene() {
		const { game } = this;
		if (game) {
			game.ready = false;
			for (let i = 0; i < this.spriteCollection.size(); i++) {
				const sprite = this.spriteCollection.get(i);
				sprite.onExit(game);
			}		

			for (let i = 0; i < game.physics.length; i++) {
				game.physics[i].onExit(game);
			}
			game.onExit(engine);
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
		this.nextTextureIndex = 0;
		this.urlToTextureIndex = {};
		this.shift.x = 0;
		this.shift.y = 0;
		this.shift.opacity = 0;
		this.shift.zoom = 1;
		this.shift.goal.x = 0;
		this.shift.goal.y = 0;
		this.shift.goal.zoom = 1;
		this.shift.goal.opacity = 0;
		this.shift.dirty = true;
	}

	resetGame() {
		this.data = {};
	}

	async addTexture(imageConfig) {
		const index = !imageConfig.url ? -1 : (this.urlToTextureIndex[imageConfig.url] ?? (this.urlToTextureIndex[imageConfig.url] = this.nextTextureIndex++));
		return await this.textureManager.createAtlas(index, this.imageLoader).setImage(imageConfig);
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

	initialize(gl, uniforms, {webgl: {depth}, viewport: {viewAngle, pixelScale, size: [viewportWidth, viewportHeight]}, options: {isPerspective}}) {
		this.bufferRenderer.setAttribute(this.shader.attributes.vertexPosition, 0, Utils.FULL_VERTICES);		
		gl.clearColor(.0, .0, .1, 1);

		const viewMatrix = mat4.fromTranslation(mat4.create(), vec3.fromValues(0, 0, 0));
		this.viewMatrix = viewMatrix;
		gl.uniformMatrix4fv(uniforms.view.location, false, this.viewMatrix);

		const zNear = -1;
		const zFar = 2000;

		const fieldOfView = (viewAngle||45) * Math.PI / 180;   // in radians
		const aspect = gl.canvas.width / gl.canvas.height;
		const perspectiveMatrix = mat4.perspective(mat4.create(), fieldOfView, aspect, zNear, zFar);
		

		const orthoMatrix = mat4.ortho(mat4.create(), -viewportWidth, viewportWidth, -viewportHeight, viewportHeight, zNear, zFar);		
		gl.uniformMatrix4fv(uniforms.ortho.location, false, orthoMatrix);
		gl.uniformMatrix4fv(uniforms.perspective.location, false, perspectiveMatrix);
		gl.uniform1f(uniforms.isPerspective.location, isPerspective || 0);
	}

	pointContains(x, y, collisionBox) {
		const px = x, py = y;
		return collisionBox.left <= px && px <= collisionBox.right && collisionBox.top <= py && py <= collisionBox.bottom;
	}

	configShader(gl, {webgl: {depth}}) {
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		if (depth) {
			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.GEQUAL);
			// gl.depthFunc(gl.LEQUAL);
		}
	}

	resize(canvas, gl, config) {
		const {viewport: {pixelScale, size: [viewportWidth, viewportHeight]}} = config;
		canvas.width = viewportWidth / pixelScale;
		canvas.height = viewportHeight / pixelScale;
		canvas.style.width = `${viewportWidth}px`;
		canvas.style.height = `${viewportHeight}px`;
		canvas.style.opacity = 1;
  		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
		this.initialize(gl, this.shader.uniforms, config);

		// this.writeCanvas.width = canvas.width;
		// this.writeCanvas.height = canvas.height;
		// this.writeCanvas.style.width = canvas.style.width;
		// this.writeCanvas.style.height = canvas.style.height;
	}

	static start(engine) {
		const loop = (time) => {
			engine.refresh(time);
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

	handleFrames(time) {
		for (let i = 0; i < this.spriteCollection.size(); i++) {
			const sprite = this.spriteCollection.get(i);
			const frame = sprite.getAnimationFrame(time);
			const previousFrame = sprite.frame;
			sprite.frame = frame;
			this.handleOnFrame(sprite, frame, previousFrame);
		}		
	}

	handleOnFrame(sprite, frame, previousFrame) {
		if (sprite.onFrame) {
			let f = sprite.onFrame[frame];
			if (typeof f === "number") {
				f = sprite.onFrame[f];
			}
			if (f) {
				f(sprite, previousFrame);
			}
		}
	}

	bestVoice(voices, voiceName) {
		if (!this.voiceReplacements) {
			this.voiceReplacements = {};
		}
		if (this.voiceReplacements[voiceName]) {
			return this.voiceReplacements[voiceName];
		}
		for (let i = 0; i < voices.length; i++) {
			if (voices[i].lang.startsWith("en")) {
				return this.voiceReplacements[voiceName] = voices[i];
			}
		}
		return this.voiceReplacements[voiceName] = voices[Math.floor(Math.random() * voices.length)];
	}

	getUterrance(msg, voiceName, mainCharacter) {
		if (!window.speechSynthesis || this.muteVoice) {
			return null;
		}
		if (!this.voices || !this.voices.length) {
			this.voices = window.speechSynthesis.getVoices();
			speechSynthesis.addEventListener("voicechanged", console.log);
		}

		const voices = this.voices;
		const voiceNames = Array.isArray(voiceName) ? voiceName : [voiceName];
		let voice = null;
		let lowestIndex = voices.length - 1;
		for (let i = 0; i < voices.length; i++) {
			const index = voiceNames.indexOf(voices[i].name);
			if (index >= 0 && index < lowestIndex) {
				voice = voices[i];
				lowestIndex = index;
			}
		}
		let replacedVoice = false;
		if (!voice) {
			voice = this.bestVoice(this.voices, voiceNames[0]);
			replacedVoice = true;
		}
		if (this.defaultVoiceReplacement && this.defaultVoiceReplacement !== "default" && mainCharacter && localStorage.getItem("alternate_voices")) {
			voices.forEach(theVoice => {
				if (theVoice.name === this.defaultVoiceReplacement && theVoice !== voice) {
					voice = theVoice;
				}
			});
			replacedVoice = true;
		}
//		console.log(this.defaultVoiceReplacement, replacedVoice);
		if (!voice) {
			return null;
		}

		if (!this.utterrances) {
			this.utterrances = {};
		}
		if (!this.utterrances[voice.name]) {
			this.utterrances[voice.name] = new SpeechSynthesisUtterance();
			this.utterrances[voice.name].voice = voice;
			// console.log(voice);
		}
		const utterance = this.utterrances[voice.name];
		utterance.text = getPhoneme(msg, voice.name);
		utterance.replacedVoice = replacedVoice;
		return utterance;
	}

	swapVoice(voice) {
		this.defaultVoiceReplacement = voice;
		localStorage.setItem("defaultVoiceReplacement", voice);
	}

	setInception(inception, extraData) {
		this.inception = inception;
		const temp = this.swapData || {};
		this.swapData = this.data;
		this.data = temp;
		if (extraData) {
			for (let i in extraData) {
				this.data[i] = extraData[i];
			}
		}

		const TempScene = this.SwapScene || StartScreen;
		this.SwapScene = engine.game.constructor;
		this.setGame(new TempScene(), true).then(game => {
			game.onInception(inception);
		});
		if (inception) {
			this.canvas.parentElement.classList.add("inception");
		} else {
			this.canvas.parentElement.classList.remove("inception");
		}

//		this.canvas.parentElement.style.transform = inception ? "translate(-40px, -100px) scale(.5)" : "";
		document.getElementById("player-overlay").style.display = inception ? "" : "none";
		document.getElementById("back-button").style.display = inception ? "" : "none";
		doResize();
	}

	changeCharacter(character) {
		document.getElementById("player-overlay").src = `assets/${character}-overlay.png`;
	}

	onDropOnOverlay(event) {
		if (this.game) {
			this.game.onDropOnOverlay(event);
		}
	}

	onDragOver(event) {
		if (this.game) {
			this.game.onDragOver(event);
		}
	}

	refresh(time) {
		const dt = time - this.lastTime;
		if (!this.focusFixer.focused) {
			this.lastTime = time;
			return;
		}

		const { game } = this;
		const { gl, ext } = this;
		const {viewport: {size: [viewportWidth, viewportHeight]}} = this.config;
		const {attributes, uniforms} = this.shader;

		if (game && game.ready) {
			if (game.paused) {
				return;
			}
			for (let i = 0; i < game.physics.length; i++) {
				game.physics[i].refresh(time, dt);
			}

			game.refresh(time, dt);

			//	Handle special frame actions
			this.handleFrames(time);
		}

		let shiftChanged = false;
		const shift = this.shift;
		if (shift.x !== shift.goal.x
			|| shift.y !== shift.goal.y
			|| shift.zoom !== shift.goal.zoom
			|| shift.opacity !== shift.goal.opacity
			|| shift.dirty) {
			const dx = (shift.goal.x - shift.x);
			const dy = (shift.goal.y - shift.y);
			const dzoom = (shift.goal.zoom - shift.zoom);
			const dopacity = (shift.goal.opacity - shift.opacity);
			const dist = Math.sqrt(dx*dx + dy*dy + dzoom*dzoom + dopacity*dopacity);
			const speed = shift.speed(dist);
			const mul = dist < .01 ? 1 : Math.min(speed, dist) / dist;
			shift.x += dx * mul;
			shift.y += dy * mul;
			shift.zoom += dzoom * mul;
			shift.opacity += dopacity * mul;
			shift.dirty = false;
			shiftChanged = true;
		}

		let shakeX = 0, shakeY = 0;
		const shake = typeof(this.shake) === "function" ? this.shake(time) : this.shake;
		if (shake) {
			if (shake > 1) {
				shakeY = (Math.random() - .5) * shake;
			}
		} else if (shake === null && this.shake) {
			this.viewMatrix = mat4.fromTranslation(this.viewMatrix, vec3.fromValues(shift.x, shift.y, 0));
			gl.uniformMatrix4fv(uniforms.view.location, false, this.viewMatrix);
			delete this.shake;
			shiftChanged = true;
		}

		if (shiftChanged || shakeX || shakeY) {
			mat4.identity(this.viewMatrix);
			const coef = shift.zoom;
			mat4.scale(this.viewMatrix, this.viewMatrix, vec3.fromValues(coef, coef, coef));
			mat4.translate(this.viewMatrix, this.viewMatrix, vec3.fromValues(shift.x*coef + shakeX, -shift.y*coef + shakeY, 0));
			gl.uniformMatrix4fv(uniforms.view.location, false, this.viewMatrix);
			gl.uniform1f(uniforms.globalOpacity.location, shift.opacity);
		}

		let didUpdate = 0;
		for (let i = 0; i < this.spriteCollection.size(); i++) {
			const sprite = this.spriteCollection.get(i);
			const { crop:[cropX, cropY]} = sprite;
			if (sprite.updated.sprite >= this.lastTime
				|| sprite.updated.crop >= this.lastTime
				|| sprite.updated.hotspot >= this.lastTime) {
				const {x, y, z, rotation, size:[width,height], hotspot:[hotX,hotY]} = sprite;
				this.spriteRenderer.setAttributeSprite(i, x, y, z, width, height, hotX, hotY, rotation, cropX, cropY);
				didUpdate++;
			}
			if (sprite.updated.animation >= this.lastTime
				|| sprite.updated.direction >= this.lastTime
				|| sprite.updated.opacity >= this.lastTime
				|| sprite.updated.crop >= this.lastTime) {
				const {direction, vdirection, opacity} = sprite;
				this.spriteRenderer.setAnimation(i, sprite.anim, direction, vdirection, opacity, cropX, cropY);
				didUpdate++;
			}
			if (sprite.updated.updateTime >= this.lastTime) {
				this.spriteRenderer.setUpdateTime(i, sprite);
				didUpdate++;
			}
		}

		//	Reset view
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.uniform1f(uniforms.time.location, time);
		gl.clearDepth(0);

		//	DRAW CALL
		ext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, this.numVerticesPerInstance, this.spriteCollection.size());

		for (let i = 0; i < this.onPostRefresh.length; i++) {
			this.onPostRefresh[i].onRefresh(time, dt);
		}

		this.lastTime = time;
	}

	postScore(score, callback) {
		if (score <= this.score) {
			return;
		}
		postScore(score, result => {
			if (result.success) {
				this.score = result.score.value;
				localStorage.setItem("bestScore", this.score);
				this.updateSidebar(this.game.sceneName, localStorage.getItem("joker"));
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
}

const engine = new Engine(globalData.config);