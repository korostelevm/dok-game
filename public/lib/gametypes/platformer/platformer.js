class Platformer extends GameBase {
	constructor(path) {
		super(path);
	}

	async init(engine, gameName) {
		await super.init(engine, gameName);
		const { gl, config } = engine;
		const jump = this.addPhysics(new Jump());
		const control = this.addPhysics(new Control());
		const gravity = this.addPhysics(new Gravity());
		const movement = this.addPhysics(new Movement());
		const collision = this.addPhysics(new Collision(true, true, false));

		const spriteMapper = new SpriteMapper(this, this.spriteFactory, this.atlas, control, this.audio, jump);
		await spriteMapper.init(engine);
		const spriteGrid = new SpriteGrid(this, this.spriteFactory, spriteMapper);
		await spriteGrid.init();

		const { grid, cols, rows } = spriteGrid.generate(this.gameModel.grid);

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

	refresh(time, dt) {
		super.refresh(time, dt);
		this.applyCamera(this.camera);
	}
}