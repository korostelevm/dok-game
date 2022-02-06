class HighlightAuxiliary extends RefresherAuxiliary {
	constructor(config, sprite) {
		super(config, sprite);
		sprite.setHighlight = value => this.setHighlight(value);
	}

	postCreate() {
		this.setHighlight(this.config.highlight);
	}

	setHighlight(highlight) {
		this.setActive(highlight);
		if (!highlight) {
			this.updateHighlight(false);
		}
	}

	updateHighlight(highlight) {
		this.sprite.changeLight(highlight ? 1 + Math.random() : 1);
	}

	onRefresh(time) {
		this.updateHighlight(true);
	}
}