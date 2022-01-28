class CollectibleAuxiliary extends Auxiliary {
	constructor(config, sprite) {
		super(config, sprite);
	}

	postCreate() {
		super.postCreate();
		const sprite = this.sprite;
		sprite.collide = 1;
		sprite.coin = 1;
		sprite.noblock = 1;
		const sound = this.config.sound || "pickup";
		const audio = sprite.game.audio[sound] || null;
		sprite.onChange = {
			...sprite.onChange,
			pickedUp: (item, value, isInit) => {
				if (value) {
					if (!isInit && audio) {
						audio.play();
					}
					item.changeActive(false);
				} else {
					item.changeActive(true);
				}
			}
		};
		sprite.onCollide = this.onCollide;
	}

	onCollide(self, sprite, xPush, yPush) {
		if (!sprite.canPickup || self.properties.pickedUp) {
			return;
		}
		self.setProperty("pickedUp", self.engine.lastTime);
	}
}