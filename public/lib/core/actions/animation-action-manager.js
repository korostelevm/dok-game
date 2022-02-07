class AnimationActionManager {
	constructor(actionManager) {
		this.actionManager = actionManager;
		this.game = actionManager.game;
	}

	performAnimation(animation) {
		const sprite = this.game[animation.sprite];
		sprite.changeAnimation(this.game.evaluate(animation.anim));
		if (animation.then) {
			new OnFrameRefresher(sprite, sprite.anim.endFrame, () => {
				this.actionManager.performAction(animation.then);
			});
		}
	}
}