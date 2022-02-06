class Delay extends Refresher {
	constructor(engine, duration, endCallback) {
		super(engine);
		this.startTime = engine.time;
		this.duration = duration;
		this.endCallback = endCallback;
	}

	getEllapsed(time) {
		return time - this.startTime;
	}

	getProgress(time) {
		return Math.min(1, this.getEllapsed(time) / this.duration);
	}

	onRefresh(time) {
		if (this.getEllapsed(time) >= this.duration) {
			this.setActive(false);
			if (this.endCallback) {
				this.endCallback();				
			}
		}
	}
}
