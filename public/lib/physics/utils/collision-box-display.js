class CollisionBoxDisplay {
	constructor(collisionBox) {
		this.collisionBox = collisionBox;
		const game = collisionBox.sprite.game;
		this.engine = game.engine;
		this.sprites = [
			this.generateBox(game, collisionBox, [90, 0 ,0]),
			this.generateBox(game, collisionBox, [-90, 0 ,0]),
			this.generateBox(game, collisionBox, [0, 180 ,0]),
			this.generateBox(game, collisionBox, [0, 0 ,0]),
			this.generateBox(game, collisionBox, [0, 90 ,0]),
			this.generateBox(game, collisionBox, [0, -90 ,0]),
		];
	}

	generateBox(game, collisionBox, rotation) {
		return game.spriteFactory.create({
			anim: game.atlas.collisionBox,
			size: [1, 1],
			x: collisionBox.sprite.x,
			y: collisionBox.sprite.y,
			z: collisionBox.sprite.z,
			rotation,
		});
	}

	onRefresh(self, time) {
		const collisionBox = self.collisionBox.getCollisionBox(time);
		self.sprites[0].changeSize(collisionBox.width, collisionBox.depth, time);
		self.sprites[0].changePosition(
			collisionBox.left,
			collisionBox.bottom,
			collisionBox.far,
			time);
		self.sprites[1].changeSize(collisionBox.width, collisionBox.depth, time);
		self.sprites[1].changePosition(
			collisionBox.left,
			collisionBox.top,
			collisionBox.close,
			time);
		self.sprites[2].changeSize(collisionBox.width, collisionBox.height, time);
		self.sprites[2].changePosition(
			collisionBox.right,
			collisionBox.top,
			collisionBox.close,
			time);
		self.sprites[3].changeSize(collisionBox.width, collisionBox.height, time);
		self.sprites[3].changePosition(
			collisionBox.left,
			collisionBox.top,
			collisionBox.far,
			time);
		self.sprites[4].changeSize(collisionBox.width, collisionBox.height, time);
		self.sprites[4].changePosition(
			collisionBox.right,
			collisionBox.top,
			collisionBox.far,
			time);
		self.sprites[5].changeSize(collisionBox.width, collisionBox.height, time);
		self.sprites[5].changePosition(
			collisionBox.left,
			collisionBox.top,
			collisionBox.close,
			time);
	}

	show() {
		for (let i = 0; i < this.sprites.length; i++) {
			this.sprites[i].changeActive(true);
		}
		this.engine.refresher.add(this);
	}

	hide() {
		for (let i = 0; i < this.sprites.length; i++) {
			this.sprites[i].changeActive(false);
		}
		this.engine.refresher.remove(this);
	}
}