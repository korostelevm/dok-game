class FpsBox extends UiComponent {
	constructor(engine) {
		super(engine);
		this.perfIndex = 0;
		this.perfTimers = new Array(20).map(() => 0);

		this.engine = engine;
		this.input = document.createElement("div");
		this.input.id = "fps-box";
		this.input.style.fontSize = "10pt";
		this.input.style.border = 0;
		this.input.style.boxOutline = 0;
		this.input.style.left = "4px";
		this.input.style.top = "4px";
		this.input.style.width = "20px";
		this.input.style.position = "absolute";
		this.input.style.zIndex = 10;
		this.input.style.color = "black";
		this.input.style.backgroundColor = "white";
		this.fps = 0;
	}

	async init() {
		document.body.appendChild(this.input);
	}

	onRefresh(self, time, dt, actualTime) {
		if (!actualTime) {
			return;
		}
		this.perfTimers[this.perfIndex] = actualTime;
		this.perfIndex = (this.perfIndex + 1) % this.perfTimers.length;
		if (Math.random() > .1) {
			return;
		}

		const timeDiff = this.perfTimers[(this.perfIndex + this.perfTimers.length - 1) % this.perfTimers.length] - this.perfTimers[this.perfIndex];
		const timeCalc = Math.round(1000 / timeDiff * this.perfTimers.length);
		if (this.fps !== timeCalc) {
			this.fps = timeCalc;
			this.input.textContent = this.fps;
		}
	}
}