class ConditionHandler {
	constructor(auxiliary) {
		this.auxiliary = auxiliary;
	}

	handleCondition(condition, callback) {
		if (condition["if-state"]) {
			this.handleIfStateCondition(condition["if-state"], condition.value, condition.else, callback);
		}
	}

	handleIfStateCondition(state, value, elseValue, callback) {
		this.auxiliary.sprite.game.stateListeners.add({
			onState: gameState => {
				if (gameState === state) {
					callback(value);
				} else {
					callback(elseValue);
				}
			}
		});
	}
}
