class GameCore {
	constructor(engine, name) {
		this.name = name;
		this.engine = engine;
		this.data = {};
		this.swapData = {};
		this.game = null;
	}

	async init() {
	}

	async onExit(engine) {
	}

	setGame(game) {
		this.game = game;
	}

	reset() {
		this.data = {};
	}
}