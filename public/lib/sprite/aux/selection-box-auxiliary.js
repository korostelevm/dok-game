class SelectionBoxAuxiliary extends MousePointerAuxiliary {
	constructor(config, sprite) {
		super(config, sprite);
		this.centerHold = config.centerHold;
		this.holdOffset = config.holdOffset || [0, 0, 0];
		this.holdAxis = config.holdAxis || [true, true, true];
		this.sprite.collide = 1;
		this.sprite.noblock = 1;
		this.selection = null;
		this.holding = false;
		this.sprite.changeOpacity(0);
		this.sprite.onEnter = (self, sprite) => {
			if (!this.holding) {
				this.changeSelection(sprite);
			}
		};
		this.sprite.onLeave = (self, sprite) => {
			if (sprite === this.selection && !this.holding) {
				this.release();
				this.changeSelection(null);
			}
		};
		this.sprite.handleMouse = (self, e, x, y) => this.handleMouse(self, e, x, y);
	}

	changeSelection(sprite) {
		if (!this.sprite.opacity) {
			return;
		}
		if (this.selection?.setHighlight) {
			this.selection.setHighlight(false);
		}
		this.release();
		this.selection = sprite;
		if (this.selection?.setHighlight) {
			this.selection.setHighlight(true);
		}
	}

	hold() {
		if (this.selection) {
			this.selection.changePosition(
				this.centerHold && this.holdAxis[0] ? this.sprite.x : this.selection.x + this.holdOffset[0],
				this.centerHold && this.holdAxis[1] ? this.sprite.y : this.selection.y + this.holdOffset[1],
				this.centerHold && this.holdAxis[2] ? this.sprite.z : this.selection.z + this.holdOffset[2]);
			this.selection.follow(this.sprite, this.holdOffset, this.holdAxis);
			this.holding = true;
			this.lastSelection = this.selection;
		} else {
			this.lastSelection = null;
		}
	}

	release() {
		if (this.selection && this.holding) {
			this.selection.changePosition(
				this.holdAxis[0] ? this.selection.x : this.selection.x - this.holdOffset[0],
				this.holdAxis[1] ? this.selection.y : this.selection.y - this.holdOffset[1],
				this.holdAxis[2] ? this.selection.z : this.selection.z - this.holdOffset[2]);
			this.selection.follow(null);
			this.holding = false;
		}
	}

	handleMouse(self, e, x, y) {
		const inGame = e.type !== "mouseleave" && x >= 0 && x < self.engine.viewportWidth && y >= 0 && y < self.engine.viewportHeight;
		const onHud = e.type !== "mouseleave" && self.game.overlayHud.visible && inGame && y >= self.engine.viewportHeight - 150;
		self.engine.changeCursor(e.type !== "mouseleave" && inGame && !onHud ? "none" : self.game.arrowCursor);
		self.changeOpacity(inGame && !onHud ? 1 : 0);
		if (!self.opacity) {
			this.changeSelection(null);					
		} else if (e.type === "mousedown") {
			this.hold();
			self.game.overlayHud.visible = this.lastSelection;
		} else if (e.type === "mouseup" || e.type === "mouseleave") {
			this.release();
		}
	}
}