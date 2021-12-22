class FpsBox {
	constructor(engine) {
		if (!engine.debug) {
			return;
		}
		engine.addUiComponent(this);
		this.perfIndex = 0;
		this.perfTimers = new Array(20).map(() => 0);

		this.engine = engine;
		this.input = document.createElement("input");
		this.input.id = "fps-box";
		this.input.style.border = 0;
		this.input.style.boxOutline = 0;
		this.input.style.right = "10px";
		this.input.style.top = "4px";
		this.input.style.width = "60px";
		this.input.style.position = "absolute";
		this.input.style.zIndex = 10;
		this.fps = null;
	}

	init() {
		document.body.appendChild(this.input);
	}

	onRefresh(time, dt, actualTime) {
		this.perfTimers[this.perfIndex] = actualTime;
		this.perfIndex = (this.perfIndex + 1) % this.perfTimers.length;
		const timeDiff = this.perfTimers[(this.perfIndex + this.perfTimers.length - 1) % this.perfTimers.length] - this.perfTimers[this.perfIndex];
		const timeCalc = Math.round(10 * 1000 / timeDiff * this.perfTimers.length) / 10;
		if (this.fps !== timeCalc) {
			this.fps = timeCalc;
			this.input.value = `${this.fps.toFixed(1)}fps`;
		}
	}
}