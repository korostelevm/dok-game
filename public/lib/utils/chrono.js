class Chrono {
	constructor() {
		this.lastTime = Date.now();
	}

	tick(msg) {
		const now = Date.now();
		const diff = now - this.lastTime;
		this.lastTime = now;
		console.log(`${diff/1000}s: ${msg}`);
	}
}