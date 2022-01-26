class HighlightAuxiliary extends RefresherAuxiliary {
	constructor(config, sprite) {
		super(config, sprite);
		sprite.setHighlight = value => this.setHighlight(value);
	}

	postCreate() {
		if (this.config.highlight) {
			this.setHighlight(true);
		} else {
			this.setHighlight(false);
		}
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

	onRefresh(self, time, dt) {
		self.updateHighlight(true);
	}
}