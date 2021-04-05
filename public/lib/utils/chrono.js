class Chrono {
	constructor() {
		this.firstTime = this.lastTime = Date.now();
	}

	tick(msg) {
		const now = Date.now();
		const diff = now - this.lastTime;
		this.lastTime = now;
//		console.log(`${(now - this.firstTime)/1000}s|%c${diff/1000}s:%c ${msg}`, diff > 200 ? 'color: #bada55' : '', '');
	}
}