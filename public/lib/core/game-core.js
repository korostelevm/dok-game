class GameCore {
	constructor(engine) {
		this.engine = engine;
		this.data = {};
		this.swapData = {};
		this.game = null;
	}

	async init() {
	}

	setGame(game) {
		this.game = game;
	}

	reset() {
		this.data = {};
	}
}