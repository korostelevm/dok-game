class OnFrameEndAuxiliary extends RefresherAuxiliary {
	constructor(config, sprite) {
		super(config, sprite);
		const atlas = sprite.game.atlas;
		this.lastFrame = null;
		this.lastAnim = null;
		this.anims = new Map();
		for (let name in config) {
			this.anims.set(atlas[name], config[name]);
		}
	}

	onRefresh(time) {
		const sprite = this.sprite;
		const frame = sprite.getAnimationFrame(time);
		if (this.lastFrame !== frame || this.lastAnim !== sprite.anim) {
			this.lastFrame = frame;
			this.lastAnim = sprite.anim;
			if (this.lastFrame === this.lastAnim.endFrame) {
				const action = this.anims.get(this.lastAnim);
				if (action) {
					this.sprite.actionManager.performAction(action);
				}
			}
		}
	}
}