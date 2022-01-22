class BouncerAuxiliary extends Auxiliary {
	constructor(config) {
		super(config);
	}

	decorate(sprite) {
		sprite.collide = 1;
		sprite.bounce = this.config.bounce || 1;
		sprite.manualRefresh = true;
		sprite.onRefresh = self => {
			if (self.engine.lastTime - self.bounced > 1000) {
				self.changeAnimation(this.config.animOnBounce);
				self.engine.refresher.delete(self);
			}
		};
	}
}