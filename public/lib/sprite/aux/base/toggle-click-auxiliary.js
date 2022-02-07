class ToggleClickAuxiliary extends Auxiliary {
	constructor(config, sprite) {
		super(config, sprite);
		this.state = 0;
		this.anims = [
			sprite.anim,
			... Array.isArray(config.toggleAnim) ? config.toggleAnim : [config.toggleAnim],
		];
		this.statesEnabled = config.stateEnabled || new Array(this.anims.length).fill(true);
		this.property = config.property;
		this.updateProperty();
		this.bindProperty();
		sprite.addMouseListener(this);
		this.hover = false;
	}

	moveToNextEnabledState(state) {
		let s = state;
		do {
			s = (s + 1) % this.anims.length;
		} while (!this.sprite.game.evaluate(this.statesEnabled[s]) && s !== state)
		return s;
	}

	getCollisionBox() {
		return this.sprite.getCollisionBox();
	}

	handleMouse(e, x, y) {
		const sprite = this.sprite;
		if (e.type === "mousedown") {
			if (this.getCollisionBox().containsPoint2d(x, y)) {
				this.setState(this.moveToNextEnabledState(this.state));
			}
		} else if (e.type === "mousemove") {
			const hover = this.getCollisionBox().containsPoint2d(x, y);
			if (this.hover !== hover) {
				this.hover = hover;
				if (this.hover) {
					sprite.engine.cursorManager.changeCursor(sprite.game.pointerCursor);
				} else {
					sprite.engine.cursorManager.changeCursor(sprite.game.arrowCursor);					
				}
			}
		}
	}

	setState(state, skipToggle) {
		this.state = state;
		this.sprite.changeAnimation(this.anims[this.state]);
		this.updateProperty();
		if (!skipToggle) {
			this.onToggle(this.state);
		}
	}

	updateProperty() {
		if (this.property) {
			this.sprite.game.setProperty(this.property, this.state);
		}
	}

	bindProperty() {
		if (this.property) {
			this.sprite.game.propertyListeners.add(this);
		}
	}
	
	onGameProperty(game, key, value) {
		if (this.property === key) {
			this.setState(value);
		}
	}


	onToggle(state) {
		
	}
}