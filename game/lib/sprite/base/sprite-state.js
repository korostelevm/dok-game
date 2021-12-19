const PROGRESS_DELTA = .1;

class SpriteState {
	constructor(states) {
		this.states = [];
		this.statesProgress = [];
		this.stateByName = {};
		this.activeStates = new Set();
		this.currentStateIndex = 0;
		this.stateChangeTime = 0;
	}

	async init(states, initialState) {
		this.states = states;
		this.statesProgress = new Array(this.states.length).fill(0);
		this.stateByName = {};
		this.activeStates.clear();
		states.forEach((state, index) => {
			this.stateByName[state.name] = state;
			state.index = index;
		});
		this.currentStateIndex = initialState ? this.stateByName[initialState].index : 0;
		this.statesProgress[this.currentStateIndex] = 1;
		this.activeStates.add(this.states[this.currentStateIndex]);
	}

	get currentState() {
		return this.states[this.currentStateIndex].name;
	}

	setState(state, time) {
		const newIndex = this.stateByName[state].index;
		if (newIndex !== this.currentStateIndex) {
			this.currentStateIndex = index;
			this.activeStates.add(this.states[this.currentStateIndex]);
		}
	}

	refreshSprite(sprite, time) {
		const mainState = this.states[this.currentStateIndex];
		let passedProgress = 0;
		const activeStateValues = this.activeStates.values();
		activeStateValues.forEach(state => {
			if (state.index !== this.currentStateIndex) {
				const progressDelta = Math.min(this.statesProgress[state.index], PROGRESS_DELTA);
				this.statesProgress[this.currentStateIndex] -= progressDelta;
				passedProgress += progressDelta;
			}
		});
		this.statesProgress[this.currentStateIndex] = Math.min(1, this.statesProgress[this.currentStateIndex] + passedProgress);

		activeStateValues.forEach(state => {
			
		});
	}

	// onRefresh(self) {
	// 	const time = self.engine.lastTime;
	// 	const hideY = self.viewportHeight;
	// 	const showY = self.viewportHeight - (self.size[1] - 1);
	// 	let progress;
	// 	if (self.showTime) {
	// 		progress = Math.min(1, (time - self.showTime) / self.animDuration);
	// 		self.changePosition(self.x, showY * (progress) + hideY * (1 - progress));
	// 		self.changeOpacity(progress);
	// 	} else if (self.hideTime) {
	// 		progress = Math.min(1, (time - self.hideTime) / self.animDuration);
	// 		self.changePosition(self.x, showY * (1 - progress) + hideY * (progress));
	// 		self.changeOpacity(1 - progress);
	// 	}
	// 	if (progress >= 1) {
	// 		self.engine.refresher.remove(self);
	// 	}
	// }		
	
}