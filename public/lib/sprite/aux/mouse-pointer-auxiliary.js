class MousePointerAuxiliary extends RefresherAuxiliary {
	constructor(config, sprite) {
		super(config, sprite);
		this.offset = this.config.offset || [0, 0, 0];
		this.mouseMultiplier = this.config.mouseMultiplier || [0, 0, 0];
		this.shiftMultiplier = this.config.shiftMultiplier || [0, 0, 0];
		this.sprite.needsMouse = true;
	}

	onRefresh(self, time, dt) {
		const engine = self.sprite.engine;
		const mouseHandlerManager = engine.mouseHandlerManager;
		const shift = engine.shift;
		const posX = mouseHandlerManager.mouseX * self.mouseMultiplier[0]
			+ shift.x * self.shiftMultiplier[0] / shift.zoom
			+ self.offset[0];
		const posY = mouseHandlerManager.mouseY * self.mouseMultiplier[1]
			+ shift.y * self.shiftMultiplier[1] / shift.zoom
			+ self.offset[1];
		const posZ = mouseHandlerManager.mouseY * self.mouseMultiplier[2]
			+ shift.z * self.shiftMultiplier[2] / shift.zoom
			+ self.offset[2];
		self.sprite.changePosition(posX, posY, posZ);
	}
}