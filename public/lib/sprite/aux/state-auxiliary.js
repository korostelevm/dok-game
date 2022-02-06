class StateAuxiliary extends Auxiliary {
	constructor(config, sprite) {
		super(config, sprite);
		const states = Array.isArray(config.state) ? config.state : [config.state];
		this.gameStates = new Set();
		states.forEach(s => this.gameStates.add(s));
		this.sprite.game.stateListeners.add(this);
	}

	onState(state) {
		this.sprite.changeActive(this.gameStates.has(state));
	}
}