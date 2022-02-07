class BlinkAuxiliary extends RefresherAuxiliary {
	constructor(config, sprite) {
		super(config, sprite);
		this.anim = config.anim || sprite.anim;
		this.blinkAnim = config.blinkAnim;
		this.chance = config.chance || 50;
	}

	onRefresh(time) {
		if (this.sprite.getLoopCount(time) >= 1) {
			const anim = this.sprite.game.evaluate(Math.random() * 100 <= this.chance ? this.blinkAnim : this.anim);
			this.sprite.changeAnimation(anim);
		}
	}
}