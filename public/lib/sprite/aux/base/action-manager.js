class ActionManager {
	constructor(sprite) {
		this.sprite = sprite;
	}

	performAction(action) {
		if (Array.isArray(action)) {
			this.performActions(action);
			return;
		}
		if (!this.checkCondition(action)) {
			return;
		}
		if (action.actions) {
			this.performAction(action.actions);
			return;
		}
		if (action.action) {
			this.performAction(action.action);
			return;
		}
		if (action.audio) {
			this.playAudio(action.audio);
		}

		if (action.animation) {
			this.playAnimation(action.animation);
		}

		if (action.sequence) {
			this.playSequence(action.sequence);
		}

		if (action.gameProperty) {
			this.performGamePropertyChange(action.gameProperty);
		}

		if (action.gameState) {
			this.performGameStateChange(action.gameState);
		}
	}

	performGamePropertyChange(property) {
		this.sprite.game.setProperty(property.name, property.value);
	}

	performGameStateChange(state) {
		this.sprite.game.changeState(state);
	}

	checkCondition(action) {
		if (action["if-key-down"]) {
			if (!this.sprite.engine.keyboardHandler.keys.has(action["if-key-down"])) {
				return false;
			}
		}

		if (action["if-key-up"]) {
			if (this.sprite.engine.keyboardHandler.keys.has(action["if-key-up"])) {
				return false;
			}
		}

		if (action["if-state"]) {
			if (this.sprite.game.state !== action["if-state"]) {
				return false;
			}
		}

		if (action["if-not-state"]) {
			if (this.sprite.game.state === action["if-not-state"]) {
				return false;
			}
		}

		return true;
	}

	performActions(actions) {
		for (let action of actions) {
			this.performAction(action);
		}
	}

	playAudio(audio) {
		this.sprite.game.audio[audio].play();
	}

	playAnimation(animation) {
		const sprite = animation.sprite ? this.sprite.game[animation.sprite] : this.sprite;
		sprite.changeAnimation(animation.anim);
		console.log(animation.anim);
	}

	playSequence(sequence) {

	}
}