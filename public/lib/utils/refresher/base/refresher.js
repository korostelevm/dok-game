class Refresher {
	constructor(engine) {
		this.engine = engine;
		this.setActive(true);
	}

	setActive(active) {
		if (active) {
			this.engine.refresher.add(this);
		} else {
			this.engine.refresher.delete(this);
		}
	}

	onRefresh() {
	}
}