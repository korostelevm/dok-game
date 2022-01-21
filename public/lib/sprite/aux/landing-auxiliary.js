class LandingAuxiliary {
	constructor(config) {
		this.config = config;
	}

	decorate(sprite) {
		const animOnLand = this.config.animOnLand;
		const animOnLeave = this.config.animOnLeave;
		sprite.onPlatform = (self, lander) => {
			self.changeAnimation(lander ? animOnLand : animOnLeave);
		};
	}	
}