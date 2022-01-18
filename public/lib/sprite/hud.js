class Hud extends Sprite {
	constructor(data, time, properties, engine, game) {
		const {viewport: {pixelScale, size: [viewportWidth, viewportHeight]}} = engine.config;
		super({...data, size:[viewportWidth, 131]}, time, properties, engine, game);
		this.animDuration = data.animDuration || 150;
	}

	show(self) {
		if (!self.showTime) {
			self.showTime = self.engine.lastTime;
			self.hideTime = 0;
			self.engine.refresher.add(self);
		}
	}

	hide(self) {
		if (!self.hideTime) {
			self.hideTime = self.engine.lastTime;
			self.showTime = 0;
			self.engine.refresher.add(self);
		}
	}

	onRefresh(self, time) {
		const viewportHeight = this.engine.viewportHeight;
		const hideY = viewportHeight;
		const showY = viewportHeight - (self.size[1] * (this.multiplier || 1) - 1);
		let progress;
		if (self.showTime) {
			progress = Math.min(1, (time - self.showTime) / self.animDuration);
			self.changePosition(self.x, showY * (progress) + hideY * (1 - progress), self.z);
			self.changeOpacity(progress);
		} else if (self.hideTime) {
			progress = Math.min(1, (time - self.hideTime) / self.animDuration);
			self.changePosition(self.x, showY * (1 - progress) + hideY * (progress), self.z);
			self.changeOpacity(1 - progress);
		}
		if (progress >= 1) {
			self.engine.refresher.delete(self);
		}
	}
}
