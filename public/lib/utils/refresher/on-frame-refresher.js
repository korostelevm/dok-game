class OnFrameRefresher extends Refresher {
	constructor(sprite, frame, callback) {
		super(sprite.engine);
		this.sprite = sprite;
		this.frame = frame;
		this.callback = callback;
		this.anim = sprite.anim;
		this.sprite.animationListeners.add(this);
		this.sprite.attachRefresher(this);
	}

	onAnimation(anim) {
		this.setActive(false);
	}

	setActive(active) {
		if (!active) {
			this.sprite.animationListeners.delete(this);
		}
		super.setActive(active);
	}

	onRefresh(time) {
		if (this.frame === this.sprite.getAnimationFrame(time)) {
			this.setActive(false);
			this.callback();				
		}
	}
}