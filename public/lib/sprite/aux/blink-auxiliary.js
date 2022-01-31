class BlinkAuxiliary extends RefresherAuxiliary {
	constructor(config, sprite) {
		super(config, sprite);
		this.anim = config.anim || sprite.anim;
		this.blinkAnim = config.blinkAnim;
		this.chance = config.chance || .5;
	}

	onRefresh(self, time, dt) {
		self.sprite.changeAnimation(Math.random() < this.chance ? this.blinkAnim : this.anim);
	}
}