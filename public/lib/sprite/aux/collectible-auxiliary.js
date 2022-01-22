class CollectibleAuxiliary extends Auxiliary {
	constructor(config) {
		super(config);
	}

	decorate(sprite) {
		sprite.collide = 1;
		sprite.coin = 1;
		sprite.noblock = 1;
		const sound = this.config.sound || "pickup";
		const audio = sprite.game.audio[sound] || null;
		sprite.onChange = {
			pickedUp: (item, value, isInit) => {
				if (value) {
					if (!isInit && audio) {
						audio.play();
					}
					item.changeActive(false);
				}
			}
		};
		sprite.onCollide = this.onCollide;
	}

	onCollide(self, sprite, xPush, yPush) {
		if (self.properties.pickedUp) {
			return;
		}
		self.setProperty("pickedUp", self.engine.lastTime);
	}
}