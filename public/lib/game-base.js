class GameBase {
	async init(engine) {
		this.engine = engine;
		this.imageLoader = engine.imageLoader;
		engine.data = engine.data || (engine.data = {});
		this.data = engine.data;
		this.sceneData = engine.data[this.sceneName] || (engine.data[this.sceneName] = {});
		this.properties = this.sceneData.properties = this.sceneData.properties || (this.sceneData.properties = {});
		this.spriteFactory = new SpriteFactory(this.sceneData, engine.spriteCollection, this);
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
			this.onChange(key, this.properties[key]);
		}
	}

	get sceneName() {
		return this.constructor.name;
	}

	onExit(engine) {
	}

	handleMouse(e) {
	}

	onDropOnOverlay(e) {
	}

	refresh(time, dt) {
	}
}