class AnimationActionManager {
	constructor(actionManager) {
		this.actionManager = actionManager;
		this.game = actionManager.game;
	}

	performAnimation(animation) {
		const sprite = this.game[animation.sprite];
		sprite.changeAnimation(animation.anim);
		if (animation.then) {
			new OnFrameRefresher(sprite, sprite.anim.endFrame, () => {
				this.actionManager.performAction(animation.then);
			});
		}
	}
}