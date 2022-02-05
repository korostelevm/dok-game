class RefresherAuxiliary extends Auxiliary {
	constructor(config, sprite) {
		super(config, sprite);
		this.conditionHandler = new ConditionHandler(this);
		this.onActivationListener = (sprite, active) => {
			this.setActive(active);
		};
		this.checkForConditions(this.config);
	}

	checkForConditions(config) {
		if (typeof(config.active) !== "undefined") {
			if (typeof(config.active) === "object") {
				this.conditionHandler.handleCondition(config.active, value => {
					this.setActive(value);
				});
			} else {
				this.setActive(config.active);
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