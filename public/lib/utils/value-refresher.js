class ValueRefresher extends Delay {
	constructor(engine, {start, end, duration, callback, endCallback}) {
		super(engine, duration, endCallback ? () => {
			endCallback(this.currentValues);
		} : null);
		this.startValues = typeof(start) === "undefined" ? [] : Array.isArray(start) ? [...start] : [start];
		this.endValues = typeof(end) === "undefined" ? [] : Array.isArray(end) ? [...end] : [end];
		this.callback = callback;
		this.currentValues = new Array(this.startValues.length);
	}

	onRefresh(time) {
		if (this.callback) {
			const progress = this.getProgress(time);
			const antiprogress = 1 - progress;
			for (let i = 0; i < this.currentValues.length; i++) {
				this.currentValues[i] = this.startValues[i] * antiprogress + this.endValues[i] * progress;
			}
			this.callback.apply(this, this.currentValues);
		}
		super.onRefresh(time);
	}
}