class DoorAuxiliary extends Auxiliary {
	constructor(config, sprite) {
		super(config, sprite);
	}

	postCreate() {
		super.postCreate();
		const sprite = this.sprite;
		sprite.collide = 1;
		sprite.noblock = 1;
		sprite.onOpen = (self, opener) => this.onOpen(self, opener);
		sprite.onChange = {
			opened: (self, opened) => {
				self.door.changeAnimation(opened ? this.config.animOnOpen : this.config.animOnClose);
			},
		};

		sprite.door = sprite.game.spriteFactory.create({
			id: "door_" + sprite.id,
			anim: this.config.animOnClose,
			size: sprite.size,
			x: sprite.x, y: sprite.y, z: sprite.z,
		});
	}

	onOpen(self, opener) {
		self.setProperty("opened", self.properties.opened ? 0 : self.engine.lastTime);
		if (this.config.shouldZoom) {
			self.game.camera = self.properties.opened ? "zoom" : "normal";
		}
	}
}