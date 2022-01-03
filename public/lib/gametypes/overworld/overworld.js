class Overworld extends GameBase {
	constructor(path) {
		super();
		if (!path) {
			console.warn("Game model is required.");
		}
		this.path = path;
	}

	async init(engine, gameName) {
		super.init(engine, gameName);

		const json = await engine.fileUtils.load(this.path);
		this.gameModel = json;

		const gameModel = this.gameModel;
		this.atlas = await TextureAtlas.makeAtlases(engine, gameModel.atlas);

		const { gl, config } = engine;

		this.cameras = gameModel.cameras;

		for (let id in this.cameras) {
			if (this.cameras[id].default || !this.camera) {
				this.camera = id;
			}
		}

		this.audio = {};

		for (let id in gameModel.audio) {
			const { src, volume } = gameModel.audio[id];
			this.audio[id] = new Sound(src, volume || 1);
		}

		// const jump = this.addPhysics(new Jump());
		const control = this.addPhysics(new Control());
		// const gravity = this.addPhysics(new Gravity());
		const movement = this.addPhysics(new Movement());
		const collision = this.addPhysics(new Collision());

		const spriteMapper = new SpriteMapper(this, this.spriteFactory, this.atlas, control, this.audio, null);
		await spriteMapper.init(engine);

		const spriteGrid = new SpriteGrid(this, this.spriteFactory, spriteMapper);
		await spriteGrid.init();


		const [viewportWidth, viewportHeight] = config.viewport.size;

		for (let id in gameModel.world) {
			this[id] = this.spriteFactory.create(gameModel.world[id]);
		}

		const { grid, cols, rows } = spriteGrid.generate(gameModel.grid);

		const collisionMerger = new CollisionMerger();
		collisionMerger.merge(grid, cols, rows);
	}

	applyCamera(camera) {
		const cameraConfig = this.cameras[camera];
		const followed = this[cameraConfig.follow];
		const zoom = cameraConfig.zoom;
		const shift = this.engine.shift;
		shift.goal.x = -followed.x * 2 / zoom + cameraConfig.xOffset;
		shift.goal.y = -followed.y * 2 / zoom + cameraConfig.yOffset;
		shift.goal.zoom = zoom;
		if (typeof(cameraConfig.minX) !== "undefined") {
			shift.goal.x = Math.max(cameraConfig.minX, shift.goal.x);
		}
		if (typeof(cameraConfig.minY) !== "undefined") {
			shift.goal.y = Math.max(cameraConfig.minY, shift.goal.y);			
		}
		if (typeof(cameraConfig.maxX) !== "undefined") {
			shift.goal.x = Math.min(cameraConfig.maxX, shift.goal.x);
		}
		if (typeof(cameraConfig.maxY) !== "undefined") {
			shift.goal.y = Math.max(cameraConfig.maxY, shift.goal.y);			
		}
	}

	onChange(key, value) {
	}

	onExit(engine) {

	}

	handleMouse(e) {
	}

	onDropOnOverlay(e) {
	}

	refresh(time, dt) {
		super.refresh(time, dt);
		this.applyCamera(this.camera);
	}
}