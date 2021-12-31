class FpsBox extends UiComponent {
	constructor(engine) {
		super(engine);
		this.perfIndex = 0;
		this.perfTimers = new Array(20).map(() => 0);

		this.engine = engine;
		this.input = document.createElement("input");
		this.input.id = "fps-box";
		this.input.style.border = 0;
		this.input.style.boxOutline = 0;
		this.input.style.right = "10px";
		this.input.style.top = "4px";
		this.input.style.width = "40px";
		this.input.style.position = "absolute";
		this.input.style.zIndex = 10;
		this.fps = 0;
	}

	init() {
		document.body.appendChild(this.input);
	}

	onRefresh(self, time, dt, actualTime) {
		this.perfTimers[this.perfIndex] = actualTime;
		this.perfIndex = (this.perfIndex + 1) % this.perfTimers.length;
		const timeDiff = this.perfTimers[(this.perfIndex + this.perfTimers.length - 1) % this.perfTimers.length] - this.perfTimers[this.perfIndex];
		const timeCalc = Math.round(10 * 1000 / timeDiff * this.perfTimers.length) / 10;
		if (this.fps !== timeCalc) {
			this.fps = timeCalc;
			this.input.value = this.fps.toFixed(1);
		}
	}
}