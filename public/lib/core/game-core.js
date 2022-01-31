class GameCore {
	constructor(engine) {
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