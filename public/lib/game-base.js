class GameBase {
	constructor(imageLoader, data) {
		this.imageLoader = imageLoader;
		this.data = data;
	}

	async init(engine) {
		this.engine = engine;
	}

	async postInit() {
	}

	async clear(engine) {
	}

	handleMouse(e) {
	}

	onDropOnOverlay(e) {
	}

	refresh(time, dt) {
	}
}