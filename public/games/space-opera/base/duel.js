class Duel extends GameBase {
	async init(engine, gameCoreName) {
		await super.init(engine, gameCoreName);

		const onDrawGun = () => {
			if (this.right.anim === this.atlas["right-draw-shoot"]) {
				this.left.changeAnimation("left-cowboy");
				this.right.changeAnimation("right-cowboy");
				this.right.getAuxiliary("BlinkAuxiliary").setActive(true);
				this.changeState("dialog");
				return;
			}

			// this.setProperty("mute", true);
			// this.setProperty("canMute", false);
			this.right.getAuxiliary("BlinkAuxiliary").setActive(false);
			this.left.changeAnimation("left-tease");
			// setTimeout(() => {
			// 	this.right.changeAnimation("right-draw-shoot");
			// }, 250);
		};

		this.engine.keyboardHandler.addKeyDownListener(' ', onDrawGun);
	}

	onChangeCanMute(value) {
		this.mute.changeActive(value);
	}
}