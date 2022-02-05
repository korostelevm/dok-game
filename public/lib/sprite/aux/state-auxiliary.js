class StateAuxiliary extends Auxiliary {
	constructor(config, sprite) {
		super(config, sprite);
		this.gameState = config.gameState;
		this.sprite.game.addStateListener(this);
	}

	onState(state) {
		this.sprite.changeActive(state === this.gameState);
	}
}