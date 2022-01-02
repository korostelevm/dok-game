class ValueRefresher {
	constructor(engine, {start, end, duration, callback}) {
		this.engine = engine;
		this.start = start;
		this.end = end;
		this.duration = duration;
		this.callback = callback;
		this.startTime = this.engine.lastTime;
		engine.refresher.add(this);
	}

	onRefresh(self, time) {
		const progress = Math.min(1, (time - this.startTime) / this.duration);
		const antiprogress = 1 - progress;
		this.callback(this.start * antiprogress + this.end * progress);
		if (progress >= 1) {
			this.engine.refresher.delete(this);
		}
	}
}