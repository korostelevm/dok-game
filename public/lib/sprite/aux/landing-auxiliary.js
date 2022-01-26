class LandingAuxiliary extends Auxiliary {
	constructor(config, sprite) {
		super(config, sprite);
		sprite.onPlatform = (self, lander) => this.onPlatform(self, lander);
	}

	onPlatform(self, lander) {
		self.changeAnimation(lander ? this.config.animOnLand : this.config.animOnLeave);		
	}
}