class MuteAuxiliary extends ToggleClickAuxiliary {
	constructor(config, sprite) {
		super(config, sprite);
		sprite.game.addPropertyListener(this);

	}

	onGameProperty(game, key, value) {
		if (key === "mute") {
			this.setState(value?1:0, true);
		}
	}

	onToggle(state) {
		this.sprite.game.setProperty("mute", state);
	}
}