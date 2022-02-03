class ToggleClickAuxiliary extends Auxiliary {
	constructor(config, sprite) {
		super(config, sprite);
		this.state = 0;
		this.anims = [
			sprite.anim,
			config.toggleAnim,
		];
		sprite.handleMouse = (sprite, e, x, y) => {
			if (e.type === "mousedown") {
				if (sprite.getCollisionBox().containsPoint2d(x, y)) {
					this.setState(1 - this.state);
				}
			} else if (e.type === "mousemove") {
				if (sprite.getCollisionBox().containsPoint2d(x, y)) {
					sprite.engine.cursorManager.changeCursor(sprite.game.pointerCursor);
				} else {
					sprite.engine.cursorManager.changeCursor(sprite.game.arrowCursor);					
				}
			}
		};
	}

	setState(state, skipToggle) {
		this.state = state;
		this.sprite.changeAnimation(this.anims[this.state]);
		if (!skipToggle) {
			this.onToggle(this.state);
		}
	}

	onToggle(state) {
		
	}
}