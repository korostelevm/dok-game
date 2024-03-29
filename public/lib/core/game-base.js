class GameBase {
	constructor(path, configOverride) {
		this.path = path;
		this.configOverride = configOverride;	
		this.physics = [];
		this.audio = {};
		this.atlas = {};
		this.cameras = {};
		this.stateListeners = new Set();
		this.propertyListeners = new Set();
		this.ready = 0;
		this.bodyStyle = null;
		this.bodyStyleBack = {};
	}

	async init(engine, coreName) {
		this.engine = engine;
		this.imageLoader = engine.imageLoader;
		this.core = await engine.getCore(coreName);
		this.core.setGame(this);
		this.data = this.core.data;
		this.sceneData = this.data[this.sceneTag] || (this.data[this.sceneTag] = {});
		this.properties = this.sceneData.properties = this.sceneData.properties || (this.sceneData.properties = {});
		this.evaluator = new Evaluator(this.properties);		
		this.spriteFactory = new SpriteFactory(this.data, engine.spriteCollection, this);
		this.data.sceneTag = this.sceneTag;
		this.sceneData.seenTime = (this.sceneData.seenTime || 0) + 1;
		this.swapData = this.core.swapData;
		this.atlas.empty = await engine.addTexture({
			spriteWidth: 0, spriteHeight: 0,
		});
		this.pointerCursor = 'var(--pointer-cursor)';
		this.arrowCursor = 'var(--mouse-cursor)';

		const gameModel = await this.getGameModel(engine);
		if (this.gameModel) {
			this.atlas = {
				...this.atlas,
				...(await TextureAtlas.makeAtlases(engine, this.gameModel.atlas) || {}),
			};
			this.cameras = this.gameModel.cameras || {};
			for (let id in this.cameras) {
				if (this.cameras[id].default || !this.camera) {
					this.camera = id;
				}
			}

			for (let id in this.gameModel.audio) {
				const { src, volume } = this.gameModel.audio[id];
				this.audio[id] = engine.soundManager.getSound(src, volume ?? 1);
			}

			for (let id in this.gameModel.world) {
				this.addToWorld(this.gameModel.world[id], id);
			}

			if (this.gameModel.physics) {
				for (let physic of this.gameModel.physics) {
					const { id, type, config } = physic;
					const classObj = nameToClass(type);
					this[id] = this.addPhysics(new classObj(config||{}));
				}
			}

			if (this.gameModel.gridData) {
				const mapper = new SpriteMapper(this, this.gameModel.gridData.mapping);
				await mapper.init(engine);
				const spriteGrid = new SpriteGrid(this, mapper);

				const { grid, cols, rows } = spriteGrid.generate(this.gameModel.gridData.grid);

				const collisionMerger = new CollisionMerger();
				collisionMerger.merge(grid, cols, rows);
				collisionMerger.cleanupMerged(engine.spriteCollection);
			}

			if (this.gameModel.settings?.clamp) {
				const { left, right, top, bottom, close, far } = this.gameModel.settings.clamp;
				this.engine.setClamp(left || 0, right || 0, top || 0, bottom || 0, close || 0, far || 0);
			}

			if (this.gameModel.settings?.forceRefreshOnMouse) {
				this.engine.mouseHandlerManager.setForceRefreshOnMouse(true);
			}

			this.engine.changeBackgroundColor(this.gameModel.settings?.backgroundColor || "#000000")

			this.bodyStyle = this.gameModel.settings?.bodyStyle;
			for (let prop in this.bodyStyle) {
				this.bodyStyleBack[prop] = document.body.style[prop];
				document.body.style[prop] = this.bodyStyle[prop];
			}

			this.state = null;
			this.states = {};
			if (this.gameModel.states) {
				for (let state in this.gameModel.states) {
					const config = this.gameModel.states[state];
					this.states[state] = new State(state, config, this);
					if (config.start) {
						this.state = state;
					}
				}
			}
		}

		console.log("Total spriteSize: ", engine.spriteCollection.size());
	}

	evaluate(data) {
		return this.evaluator.evaluate(data);
	}

	addToWorld(item, id) {
		if (Array.isArray(item)) {
			item.forEach((it, i) => this.addToWorld(it, `${id}_${i}`));
		} else {
			this[id] = this.spriteFactory.create({id, ...item}, item.properties);
		}
	}

	addPhysics(physics) {
		this.physics.push(physics);
		return physics;
	}

	onInception(inception) {		
	}

	getPointerCursor() {
		return this.pointerCursor;
	}

	isFirstTime() {
		return this.sceneData.seenTime === 1;
	}

	setProperty(key, value) {
		if (this.properties[key] !== value) {
			const oldValue = this.properties[key];
			this.properties[key] = value;
			this.onChange(key, value, oldValue);
		}
	}

	onChange(key, value, oldValue) {
		for (let listener of this.propertyListeners) {
			listener.onGameProperty(this, key, value, oldValue);
		}
		switch(key) {
			case "loop":
				if (this.audio[this.properties.music]) {
					this.audio[this.properties.music].setLoop(value);
				}
				break;
			case "mute":
				this.onMusicChange(this.properties.music, this.properties.mute, this.properties.loop);
				break;
			case "music":
				if (oldValue) {
					this.audio[oldValue].stop();
				}
				if (!value) {
					this.setProperty("loop", false);
				}
				this.onMusicChange(this.properties.music, this.properties.mute, this.properties.loop);
				break;
		}
	}

	onMusicChange(music, mute, loop) {
		if (this.audio[music]) {
			if (!mute) {
				if (loop) {
					this.audio[music].loop();	
				} else {
					this.audio[music].play();
				}
			} else {
				this.audio[music].stop();
			}
		}
	}

	async postInit() {
		for (let key in this.properties) {
			this.onChange(key, this.properties[key]);
		}
		this.spriteFactory.postCreate();
		this.engine.setPerspective(await this.isPerspective());
		await this.engine.cursorManager.changeCursor(null, true);
		if (this.camera) {
			this.applyCamera(this.camera, 0);
		}

		if (this.state) {
			this.states[this.state].applyStateChange();
		}
	}

	applyCamera(camera, time) {
		const cameraConfig = this.cameras[camera];
		if (!cameraConfig) {
			return;
		}
		const timeSinceReady = time - this.ready;
		const followed = this[cameraConfig.follow];
		const position = followed?.getRealPosition() || Constants.EMPTY_POSITION;
		const zoom = cameraConfig.zoom || 1;
		const zoom2 = zoom * zoom;
		const shift = this.engine.shift;
		shift.goal.x = -position[0] * 2 / zoom2 + (cameraConfig.xOffset || 0) / zoom2;
		shift.goal.y = -position[1] * 2 / zoom2 + (cameraConfig.yOffset || 0) / zoom2
		shift.goal.z = +position[2] * 2 / zoom2 + (cameraConfig.zOffset || 0) / zoom2;
		shift.goal.zoom = zoom;
		if (cameraConfig.rotation) {
			shift.goal.rotation[0] = (cameraConfig.rotation[0] || 0);
			shift.goal.rotation[1] = (cameraConfig.rotation[1] || 0);
			shift.goal.rotation[2] = (cameraConfig.rotation[2] || 0);
		}
		if (typeof(cameraConfig.minX) !== "undefined") {
			shift.goal.x = Math.max(cameraConfig.minX, shift.goal.x);
		}
		if (typeof(cameraConfig.minY) !== "undefined") {
			shift.goal.y = Math.max(cameraConfig.minY, shift.goal.y);			
		}
		if (typeof(cameraConfig.minZ) !== "undefined") {
			shift.goal.z = Math.max(cameraConfig.minZ, shift.goal.z);			
		}
		if (typeof(cameraConfig.maxX) !== "undefined") {
			shift.goal.x = Math.min(cameraConfig.maxX, shift.goal.x);
		}
		if (typeof(cameraConfig.maxY) !== "undefined") {
			shift.goal.y = Math.max(cameraConfig.maxY, shift.goal.y);			
		}
		if (typeof(cameraConfig.maxZ) !== "undefined") {
			shift.goal.z = Math.max(cameraConfig.maxZ, shift.goal.z);			
		}
	}

	get sceneTag() {
		return this.path?.split("/").pop() || this.constructor.name;
	}

	async getGameModel(engine) {
		if (this.gameModel) {
			return this.gameModel;
		}
		let gameModel = this.configOverride ?? (await engine.fileUtils.load(this.path) || {});
		const settings = gameModel.settings || (gameModel.settings = {});
		if (!settings.viewportSize) {
			settings.viewportSize = this.getDefaultViewportSize();
		}
		if (!settings.windowSize) {
			settings.windowSize = this.getDefaultWindowSize(settings.viewportSize[0], settings.viewportSize[1]);
		}
		if (!settings.margin) {
			settings.margin = this.getMargin();
		}
		gameModel = await engine.configMerger.process(gameModel, this.path, settings);
		return this.gameModel = gameModel;
	}

	async getSettings(engine) {
		if (this.gameSettings) {
			return this.gameSettings;
		}
		return this.gameSettings = (await this.getGameModel(engine)).settings;
	}

	async isPerspective() {
		return (await this.getSettings(this.engine)).perspective;
	}

	getMargin() {
		return null;
	}

	getDefaultViewportSize() {
		return Constants.defaultViewportSize();
	}

	getDefaultWindowSize(viewportWidth, viewportHeight) {
		return Constants.defaultWindowSize(viewportWidth, viewportHeight);
	}

	async onExit(engine) {
		this.setProperty("music", null);
		this.setProperty("loop", false);

		for (let prop in this.bodyStyleBack) {
			document.body.style[prop] = this.bodyStyleBack[prop];
		}

		this.stateListeners.clear();
		this.propertyListeners.clear();
	}

	refresh(time, dt) {
		this.applyCamera(this.camera, time);
	}

	changeState(state) {
		if (this.state !== state) {
			const oldState = this.state;
			const oldStateObj = this.states[oldState];
			if (oldStateObj) {
				oldStateObj.changeActive(false);
			}
			this.state = state;
			const newStateObj = this.states[this.state];
			newStateObj.changeActive(true);
			newStateObj.applyStateChange();
			for (let listener of this.stateListeners) {
				listener.onState(this.state, oldState);
			}
		}
	}

	addPropertyListener(listener, property) {
		this.propertyListeners.add(!property ? listener : {
			onChange: (key, value) => {
				if (key === property) {
					listener[`onChange${key.charAt(1).toUpperCase()}${key.substr(1)}`](value);
				}
			},
		});
	}

	fadeVolume(volume) {
		const audio = this.audio[this.properties.music];
		if (audio) {
			audio.fadeVolume(volume, 2000, this.engine);
		}
	}
}