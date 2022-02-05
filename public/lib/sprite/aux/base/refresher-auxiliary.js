class RefresherAuxiliary extends Auxiliary {
	constructor(config, sprite) {
		super(config, sprite);
		this.onActivationListener = (sprite, active) => {
			this.setActive(active);
		};
		this.checkForConditions(this.config);
	}

	checkForConditions(config) {
		if (config.active) {
			if (typeof(active) === "object") {

			} else {
				
			}
		}
	}


	setActive(active) {
		if (!active) {
			this.sprite.engine.refresher.delete(this);
		} else {
			this.sprite.engine.refresher.add(this);
		}
	}

	postCreate() {
		this.sprite.addActivationListener(this.onActivationListener);
		this.onActivationListener(this.sprite, this.sprite.active);
	}

	onRefresh(self, time, dt) {
	}
}