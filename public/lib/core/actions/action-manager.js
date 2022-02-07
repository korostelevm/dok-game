class ActionManager {
	constructor(state) {
		this.state = state;
		this.game = this.state.game;
		this.animationActionManager = new AnimationActionManager(this);
	}

	applyStateChange(newStateObj) {
		this.performAction(newStateObj.config);
	}

	performAction(action) {
		if (!action) {
			return;
		}

		const { animation, actions, state, properties, on,
			delay, interval, light, fadeVolume, log, chance, medal } = action;

		if (delay) {
			this.performDelayedAction(action, delay);
			return;
		}

		if (interval) {
			this.performIntervalAction(action, interval);
			return;
		}

		if (action["if-property"]) {
			if (!this.checkPropertyCondition(action["if-property"])) {
				return;
			}
		}

		if (action["if-not-property"]) {
			if (!this.checkPropertyCondition(action["if-not-property"], true)) {
				return;
			}
		}

		if (chance) {
			if (Math.random() * 100 > chance) {
				return;
			}
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
				this.game.setProperty(prop, this.game.evaluate(properties[prop]));
			}
		}

		if (on) {
			if (on.keydown) {
				this.handleStateOnKey(on.keydown, on, true, this.game.state);
			}
			if (on.keyup) {
				this.handleStateOnKey(on.keyup, on, true, this.game.state);
			}
			if (on.mousedown) {
				this.handleStateMouse(on, "mousedown", this.game.state);
			}
			if (on.mouseup) {
				this.handleStateMouse(on, "mouseup", this.game.state);
			}
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

		if (medal) {
			getMedal(medal, showUnlockedMedal)			
		}

		if (typeof(light) !== "undefined") {
			this.game.engine.shift.fadeLight(light);
		}

		if (typeof(fadeVolume) !== "undefined") {
			this.game.fadeVolume(fadeVolume);
		}
	}

	performDelayedAction(action, delay) {
		const actionCopy = { ... action };
		delete actionCopy["delay"];
		this.game.engine.delayAction(delay, () => this.performAction(actionCopy), this.state);
	}

	performIntervalAction(action, interval) {
		const actionCopy = { ... action };
		delete actionCopy["interval"];
		this.game.engine.repeatAction(interval, () => this.performAction(actionCopy), this.state);		
	}

	handleStateMouse(action, type, state) {
		const mouseHandler = {
			handleMouse: (e, x, y, hovered) => {
				if (e.type === type) {
					if (action.nohover && hovered.size) {
						return;
					}
					this.performAction(action);
				}
			}
		};
		const stateListener = {
			onState: (newState, oldState) => {
				if (oldState === state) {
					this.game.engine.mouseHandlerManager.remove(mouseHandler);		
					this.game.stateListeners.delete(stateListener);
				}
			}
		};
		this.game.engine.mouseHandlerManager.add(mouseHandler);		
		this.game.stateListeners.add(stateListener);
	}

	handleStateOnKey(key, action, down, state) {
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
		if (down) {
			this.game.engine.keyboardHandler.addKeyDownListener(key, listener);
		} else {
			this.game.engine.keyboardHandler.addKeyUpListener(key, listener);			
		}
		this.game.stateListeners.add(stateListener);
	}

	checkPropertyCondition(condition, not) {
		const { property, value } = typeof(condition) === "object" ? condition : { property:condition };
		const result = typeof(value) === "undefined" ? this.game.properties[property] : this.game.properties[property] === value;
		return not ? !result : result;
	}
}