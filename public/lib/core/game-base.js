class GameBase {
	constructor(path, configOverride) {
		this.path = path;
		this.configOverride = configOverride;	
		this.physics = [];
		this.audio = {};
		this.atlas = {};
		this.cameras = {};
		this.state = null;
		this.states = [];
		this.stateListeners = new Set();
		this.ready = 0;
		this.music = null;
		this.bodyStyle = null;
		this.bodyStyleBack = {};
	}

	async init(engine, gameName) {
		this.engine = engine;
		this.imageLoader = engine.imageLoader;
		this.gameName = gameName;
		this.core = await engine.getCore(gameName);
		this.core.setGame(this);
		this.data = this.core.data;
		this.sceneData = this.data[this.sceneTag] || (this.data[this.sceneTag] = {});
		this.properties = this.sceneData.properties = this.sceneData.properties || (this.sceneData.properties = {});
		this.spriteFactory = new SpriteFactory(this.data, engine.spriteCollection, this);
		if (!this.data.gender) {
			this.data.gender = (this.engine.inception ? null : localStorage.getItem("playerGender")) || "M";
		}
		this.data.sceneTag = this.sceneTag;
		this.sceneData.seenTime = (this.sceneData.seenTime || 0) + 1;
		this.swapData = engine?.swapData?.TheImpossibleRoom;

		ChronoUtils.tick();
		const gameModel = await this.getGameModel(engine);
		ChronoUtils.tick();
		if (this.gameModel) {
			this.atlas = {
				...(await TextureAtlas.makeAtlases(engine, this.gameModel.atlas) || {}),
			};
			ChronoUtils.tick();
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

			this.bodyStyle = this.gameModel.settings?.bodyStyle;
			for (let prop in this.bodyStyle) {
				this.bodyStyleBack[prop] = document.body.style[prop];
				document.body.style[prop] = this.bodyStyle[prop];
			}

			this.states = this.gameModel.states || [];
			this.state = null;
			for (let state in this.states) {
				if (this.states[state].start) {
					this.state = state;
				}
			}
		}
		this.atlas.empty = await engine.addTexture({
			spriteWidth: 0, spriteHeight: 0,
		});
		this.pointerCursor = 'var(--pointer-cursor)';
		this.arrowCursor = 'var(--mouse-cursor)';

		console.log("Total spriteSize: ", engine.spriteCollection.size());
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
			this.properties[key] = value;
			this.onChange(key, value);
		}
	}

	onChange(key, value) {
	}

	async postInit() {
		for (let key in this.properties) {
			this.onChange(key, this.properties[key], true);
		}
		this.spriteFactory.postCreate();
		this.engine.setPerspective(await this.isPerspective());
		await this.engine.cursorManager.changeCursor(null, true);
		if (this.camera) {
			this.applyCamera(this.camera, 0);
		}

		if (this.state) {
			this.applyState(this.state);
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
		this.changeMusic(null);

		for (let prop in this.bodyStyleBack) {
			document.body.style[prop] = this.bodyStyleBack[prop];
		}
	}

	refresh(time, dt) {
		this.applyCamera(this.camera, time);
	}

	changeState(state) {
		if (this.state !== state) {
			this.state = state;
			this.applyState(this.state);
		}
	}

	applyState(state) {
		const { music, loopMusic } = this.states[state] || {};
		this.changeMusic(music ?? null, loopMusic);
		for (let listener of this.stateListeners) {
			listener.onState(listener, state);
		}
	}

	addStateListener(state) {
		this.stateListeners.add(state);
	}

	changeMusic(music, loop) {
		if (music !== this.music) {
			if (this.music) {
				this.audio[this.music].stop();
			}
			this.music = music;
			if (this.music) {
				if (loop) {
					this.audio[this.music].loop();
				} else {
					this.audio[this.music].play();
				}
			}
		}
	}
}