class Refresher {
	constructor() {
		this.refreshers = [];		
	}

	addRefresh(sprite) {
		if (typeof(sprite.refreshIndex) === "undefined") {
			sprite.refreshIndex = this.refreshers.length;
			this.refreshers.push(sprite);
		}
	}

	removeRefresh(sprite) {
		const refreshIndex = sprite.refreshIndex;
		if (refreshIndex !== null) {
			this.refreshers[refreshIndex] = this.refreshers[this.refreshers.length - 1];
			this.refreshers[refreshIndex].refreshIndex = refreshIndex;
			this.refreshers.pop();
			delete sprite.refreshIndex;
		}
	}

	getRefreshers() {
		return this.refreshers;
	}

}