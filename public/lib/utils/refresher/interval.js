class Interval extends Refresher {
	constructor(engine, interval, callback) {
		super(engine);
		this.interval = interval;
		this.callback = callback;
		this.updateNextRefresh(engine.time);
	}

	updateNextRefresh(time) {
		this.nextRefresh = time + this.interval;
	}

	onRefresh(time) {
		if (time > this.nextRefresh) {
			this.updateNextRefresh(this.nextRefresh);
			this.callback();
		}
	}
}