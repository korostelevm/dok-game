class FpsBox {
	constructor(engine) {
		if (!engine.debug) {
			return;
		}
		engine.addOnPostRefresh(this);
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
	}

	init() {
		document.getElementById("container").appendChild(this.input);
	}

	onRefresh(time, dt) {
		this.perfTimers[this.perfIndex] = time;
		this.perfIndex = (this.perfIndex + 1) % this.perfTimers.length;
		const timeDiff = this.perfTimers[(this.perfIndex + this.perfTimers.length - 1) % this.perfTimers.length] - this.perfTimers[this.perfIndex];
		const timeCalc = 1000 / timeDiff * this.perfTimers.length;
		const newFPS = `${timeCalc.toFixed(1)}fps`
		if (this.input.value !== newFPS) {
			this.input.value = newFPS;
		}
	}
}