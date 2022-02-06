class MuteAuxiliary extends ToggleClickAuxiliary {
	constructor(config, sprite) {
		super(config, sprite);
		sprite.game.addPropertyListener(this);

	}

	onGameProperty(game, key, value) {
		if (key === "mute") {
			this.setState(value?1:0, true);
		}
		if (key === "music" || key === "canMute") {
			this.sprite.changeActive(game.properties.music && game.properties.canMute);
		}
	}

	onToggle(state) {
		this.sprite.game.setProperty("mute", state);
	}
}