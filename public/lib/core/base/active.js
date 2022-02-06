class Active {
	constructor() {
		this.activationListeners = new Set();		
		this.active = true;
		this.updateFlag = 0xFFFFFFFF;
	}

	changeActive(value) {
		if (this.active !== value) {
			this.active = value;
			this.updateFlag |= Constants.UPDATE_FLAG.ACTIVE;
			for (let listener of this.activationListeners) {
				listener(this, value);
			}
			return true;
		}
		return false;
	}	

	linkRefresher(refresher) {
		this.activationListeners.add((self, active) => {
			refresher.setActive(active);
		});
	}

	attachRefresher(refresher) {
		this.activationListeners.add((self, active) => {
			if (!active) {
				refresher.setActive(false);
			}
		});
	}

	clear() {
		this.changeActive(false);
		this.activationListeners.clear();
	}
}