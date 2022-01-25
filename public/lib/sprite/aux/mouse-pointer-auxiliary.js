class MousePointerAuxiliary extends Auxiliary {
	constructor(config) {
		super(config);
		this.offset = this.config.offset || [0, 0, 0];
		this.mouseMultiplier = this.config.mouseMultiplier || [0, 0, 0];
		this.shiftMultiplier = this.config.shiftMultiplier || [0, 0, 0];
		this.onActivationListener = (sprite, active) => {
			if (!active) {
				sprite.engine.refresher.delete(this);
			} else {
				sprite.engine.refresher.add(this);
			}
		};
	}

	decorate(sprite) {
		this.sprite = sprite;
		this.sprite.needsMouse = true;
		sprite.addActivationListener(this.onActivationListener);
		this.onActivationListener(sprite, sprite.active);
	}

	gridInit(self, col, row, grid) {
	}

	onRefresh(self, time, dt) {
		const engine = self.sprite.engine;
		const mouseHandlerManager = engine.mouseHandlerManager;
		const shift = engine.shift;
		const posX = mouseHandlerManager.mouseX * self.mouseMultiplier[0]
			+ shift.x * self.shiftMultiplier[0]
			+ self.offset[0];
		const posY = mouseHandlerManager.mouseY * self.mouseMultiplier[1]
			+ shift.y * self.shiftMultiplier[1]
			+ self.offset[1];
		const posZ = mouseHandlerManager.mouseY * self.mouseMultiplier[2]
			+ shift.z * self.shiftMultiplier[2]
			+ self.offset[2];
		self.sprite.changePosition(posX, posY, posZ);
	}
}