class ActionManager {
	constructor(state) {
		this.state = state;
		this.game = this.state.game;
		this.animationActionManager = new AnimationActionManager(this);
	}

	applyStateChange(newStateObj) {
		this.performAction(newStateObj.config);
	}

	performAction(action, ignoreDelay) {
		const { animation, actions, state, properties, onKeyDown, delay, light, fadeVolume } = action || {};

		if (delay && !ignoreDelay) {
			this.performDelayedAction(action, delay);
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