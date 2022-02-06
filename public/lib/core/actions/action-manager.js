class ActionManager {
	constructor(state) {
		this.state = state;
		this.game = this.state.game;
		this.animationActionManager = new AnimationActionManager(this);
	}

	applyStateChange(newStateObj) {
		this.performAction(newStateObj.config);
	}

	performAction(action, commitAction) {
		if (!action) {
			retturn;
		}
		const { animation, actions, state, properties, onKeyDown,
			delay, interval, light, fadeVolume, log } = action;

		if (delay && !commitAction) {
			this.performDelayedAction(action, delay);
			return;
		}

		if (interval && !commitAction) {
			this.performIntervalAction(action, interval);
			return;
		}

		if (Array.isArray(action)) {
			action.forEach(act => this.performAction(act));
			return;
		}

		if (actions) {
			actions.forEach(action => this.performAction(action));
		}

		if (properties) {
			for (let prop in properties) {
				this.game.setProperty(prop, properties[prop]);
			}
		}

		if (onKeyDown) {
			this.handleStateOnKeyDown(onKeyDown.key, onKeyDown, this.game.state);
		}

		if (animation) {
			this.animationActionManager.performAnimation(animation);
		}

		if (state) {
			this.game.changeState(state);
		}

		if (log) {
			console.log(log);
		}

		if (typeof(light) !== "undefined") {
			this.game.engine.shift.fadeLight(light);
		}

		if (typeof(fadeVolume) !== "undefined") {
			this.game.fadeVolume(fadeVolume);
		}
	}

	performDelayedAction(action, delay) {
		this.game.engine.delayAction(delay, () => this.performAction(action, true), this.state);
	}

	performIntervalAction(action, interval) {
		this.game.engine.repeatAction(interval, () => this.performAction(action, true), this.state);		
	}

	handleStateOnKeyDown(key, action, state) {
		const listener = () => {
			this.performAction(action);
		};
		const stateListener = {
			onState: (newState, oldState) => {
				if (oldState === state) {
					this.game.engine.keyboardHandler.removeListener(listener);		
					this.game.stateListeners.delete(stateListener);
				}
			}
		};
		this.game.engine.keyboardHandler.addKeyDownListener(key, listener);
		this.game.stateListeners.add(stateListener);
	}
}