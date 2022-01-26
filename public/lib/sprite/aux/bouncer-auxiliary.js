class BouncerAuxiliary extends Auxiliary {
	constructor(config, sprite) {
		super(config, sprite);
	}

	postCreate() {
		super.postCreate();
		const sprite = this.sprite;
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