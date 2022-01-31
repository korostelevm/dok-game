class StateAuxiliary extends Auxiliary {
	constructor(config, sprite) {
		super(config, sprite);
		this.gameState = config.gameState;
		this.sprite.game.addStateListener(this);
	}

	onState(self, state) {
		self.sprite.changeActive(state === self.gameState);
	}
}