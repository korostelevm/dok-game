class OnFrameAuxiliary extends RefresherAuxiliary {
	constructor(config, sprite) {
		super(config, sprite);
		this.lastFrame = null;
	}

	onRefresh(self, time, dt) {
		const sprite = self.sprite;
		const frame = sprite.getAnimationFrame(time);
		if (self.lastFrame !== frame) {
			self.lastFrame = frame;

			if (self.config.onFrame[frame]) {
				self.onFrame(frame, self.config.onFrame[frame]);
			}
		}
	}

	onFrame(frame, action) {
		this.sprite.actionManager.performAction(action);
	}
}