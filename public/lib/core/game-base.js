class GameBase {
	constructor(path) {
		this.path = path;		
		this.physics = [];
		this.audio = {};
	}

	async init(engine, gameName) {
		this.engine = engine;
		this.engine.enableSidebar(false);
		this.imageLoader = engine.imageLoader;
		engine.data = engine.data || (engine.data = {});
		const gameData = engine.data[gameName] || (engine.data[gameName] = {});
		this.data = gameData;
		this.sceneData = this.data[this.sceneName] || (this.data[this.sceneName] = {});
		this.properties = this.sceneData.properties = this.sceneData.properties || (this.sceneData.properties = {});
		this.spriteFactory = new SpriteFactory(this.data, engine.spriteCollection, this);
		if (!this.data.gender) {
			this.data.gender = (this.engine.inception ? null : localStorage.getItem("playerGender")) || "M";
		}
		this.data.sceneName = this.sceneName;
		this.sceneData.seenTime = (this.sceneData.seenTime || 0) + 1;
		this.swapData = engine?.swapData?.TheImpossibleRoom;

		ChronoUtils.tick();
		this.gameModel = await engine.fileUtils.load(this.path);
		ChronoUtils.tick();
		if (this.gameModel) {
			this.atlas = await TextureAtlas.makeAtlases(engine, engine.translate(this.gameModel.atlas));
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
		}
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
		return "url(assets/pointer-cursor.png), auto";
	}

	isFirstTime() {
		return this.sceneData.seenTime === 1;
	}

	isPerpective() {
		return false;
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
		this.engine.setPerspective(this.isPerpective());
		await this.engine.changeCursor(null, true);
		if (this.getInitialShift()) {
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

	get sceneName() {
		return this.constructor.name;
	}

	async getWindowSize(engine) {
		const json = await engine.fileUtils.load(this.path);
		return json?.windowSize || [1000, 600];
	}

	async getViewportSize(engine) {
		return {
			pixelScale: 0,	//	autodetect
			viewportSize: [800, 400],
		}
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