class Hud extends Sprite {
	constructor(data, time, properties) {
		super(data, time, properties);
		this.viewportWidth = data.viewportWidth;
		this.viewportHeight = data.viewportHeight;
		this.animDuration = data.animDuration || 150;
	}

	show(self) {
		self.showTime = self.engine.lastTime;
		self.hideTime = 0;
		self.engine.addRefresh(self);
	}

	hide(self) {
		self.hideTime = self.engine.lastTime;
		self.showTime = 0;
		self.engine.addRefresh(self);
	}

	onRefresh(self) {
		const time = self.engine.lastTime;
		const hideY = self.viewportHeight;
		const showY = self.viewportHeight - (self.size[1] - 1);
		let progress;
		if (self.showTime) {
			progress = Math.min(1, (time - self.showTime) / self.animDuration);
			self.changePosition(0, showY * (progress) + hideY * (1 - progress));
			self.changeOpacity(progress);
		} else if (self.hideTime) {
			progress = Math.min(1, (time - self.hideTime) / self.animDuration);
			self.changePosition(0, showY * (1 - progress) + hideY * (progress));
			self.changeOpacity(1 - progress);
		}
		if (progress >= 1) {
			self.engine.removeRefresh(self);
		}
	}
}
