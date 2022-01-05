class GameBase {
	constructor(path) {
		this.path = path;		
		this.physics = [];
		this.audio = {};
		this.atlas = {};
	}

	async init(engine, gameName) {
		this.engine = engine;
		this.engine.enableSidebar(false);
		this.imageLoader = engine.imageLoader;
		engine.data = engine.data || (engine.data = {});
		const gameData = engine.data[gameName] || (engine.data[gameName] = {});
		this.data = gameData;
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
		this.gameModel = await engine.fileUtils.load(this.path);
		this.gameModel = await engine.configTranslator.process(this.gameModel, this);
		ChronoUtils.tick();
		if (this.gameModel) {
			this.atlas = {...(await TextureAtlas.makeAtlases(engine, this.gameModel.atlas) || {})};
			ChronoUtils.tick();
			this.cameras = this.gameModel.cameras;
			for (let id in this.cameras) {
				if (this.cameras[id].default || !this.camera) {
					this.camera = id;
				}
			}

			for (let id in this.gameModel.audio) {
				const { src, volume } = this.gameModel.audio[id];
				this.audio[id] = new Sound(src, volume || 1);
			}

			for (let id in this.gameModel.world) {
				this[id] = this.spriteFactory.create(this.gameModel.world[id]);
			}

			if (this.gameModel.physics) {
				this.gameModel.physics.forEach(physic => {
					const { id, type, config } = physic;
					const classObj = nameToClass(type);
					this[id] = this.addPhysics(new classObj(config));
				});
			}

			if (this.gameModel.gridData) {
				const mapperClass = nameToClass(this.gameModel.gridData.mapper);
				const mapper = new mapperClass(this);
				await mapper.init(engine);
				const spriteGrid = new SpriteGrid(this, mapper);
				await spriteGrid.init();

				const { grid, cols, rows } = spriteGrid.generate(this.gameModel.gridData.grid);

				const collisionMerger = new CollisionMerger();
				collisionMerger.merge(grid, cols, rows);
			}
		}
		this.atlas.collisionBox = await engine.addTexture({
			url: "assets/red-square.png",
		});
		this.atlas.empty = await engine.addTexture({
			spriteWidth: 0, spriteHeight: 0,
		});
		const mouseCursor = await engine.imageLoader.getBlobUrl("assets/pointer-cursor.png");
		this.mouseCursorUrl = `url(${mouseCursor}), auto`;
	}

	addPhysics(physics) {
		this.physics.push(physics);
		return physics;
	}

	onUnlockMedal(medal) {
		showUnlockedMedal(medal);
	}

	achieve(achievement, nameOverride) {
		getMedal(achievement, this.onUnlockMedal);
		const gameName = nameOverride || this.constructor.name;
		const level = engine.getLevelFor(gameName);
		console.log("Passed:", level, achievement);
		this.engine.postScore(level);
	}

	onInception(inception) {		
	}

	getMouseCursor() {
		return this.mouseCursorUrl;
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
		this.engine.enableSidebar(true);
		this.engine.setPerspective(await this.isPerspective());
		await this.engine.changeCursor(null, true);
		if (this.camera) {
			this.applyCamera(this.camera);
		} else if (this.getInitialShift()) {
			const { x, y, z, rotation, light, zoom } = this.getInitialShift() || {};
			const [rotX, rotY, rotZ] = rotation || [];
			this.engine.shift.goal.x = x || 0;
			this.engine.shift.goal.y = y || 0;
			this.engine.shift.goal.z = z || 0;
			this.engine.shift.goal.rotation[0] = rotX || 0;
			this.engine.shift.goal.rotation[1] = rotY || 0;
			this.engine.shift.goal.rotation[2] = rotZ || 0;
			this.engine.shift.goal.light = light ?? 1;
			this.engine.shift.goal.zoom = zoom ?? 1;
		}
	}

	applyCamera(camera) {
		const cameraConfig = this.cameras[camera];
		const zoom = cameraConfig.zoom;
		const shift = this.engine.shift;
		const followed = this[cameraConfig.follow];
		const position = followed.getRealPosition();

		shift.goal.x = cameraConfig.xOffset - position[0] * 2 + 800;
		shift.goal.y = cameraConfig.yOffset - position[1] * 2 + 800;
		shift.goal.z = cameraConfig.zOffset + position[2] * 2 - 500;
		shift.goal.zoom = zoom;
		shift.goal.rotation[0] = cameraConfig.rotation[0];
		shift.goal.rotation[1] = cameraConfig.rotation[1];
		shift.goal.rotation[2] = cameraConfig.rotation[2];
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

	async getSettings(engine) {
		const json = await engine.fileUtils.load(this.path);
		const settings = json?.settings || {};		
		if (!settings.viewportSize) {
			settings.viewportSize = [800, 400];
		}
		if (!settings.windowSize) {
			settings.windowSize = [settings.viewportSize[0] + 200, settings.viewportSize[1] + 200];
		}
		return settings;
	}

	async isPerspective() {
		return (await this.getSettings(this.engine)).perspective;
	}

	getInitialShift() {
		return null;
	}

	async onExit(engine) {
	}

	handleMouse(e) {
	}

	onDropOnOverlay(e) {
	}

	onDragOver(e) {
	}

	refresh(time, dt) {
	}

	selectDialog(index) {
	}
}