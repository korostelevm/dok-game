class CollisionBoxDisplay {
	constructor(collisionBox) {
		this.collisionBox = collisionBox;
		const game = collisionBox.sprite.game;
		this.engine = game.engine;
		this.active = true;
		this.sprites = [
			this.generateBox(game, collisionBox, [90, 0 ,0]),
			this.generateBox(game, collisionBox, [-90, 0 ,0]),
			this.generateBox(game, collisionBox, [0, 180 ,0]),
			this.generateBox(game, collisionBox, [0, 0 ,0]),
			this.generateBox(game, collisionBox, [0, 90 ,0]),
			this.generateBox(game, collisionBox, [0, -90 ,0]),
		];

		this.repositionSprites(engine.lastTime);
		for (let sprite of this.sprites) {
			sprite.follow(this.collisionBox.sprite);
		}
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

	repositionSprites(time) {
		const collisionBox = this.collisionBox.getCollisionBox(time);
		if (!collisionBox) {
			return;
		}
		this.sprites[0].changeSize(collisionBox.width, collisionBox.depth, time);
		this.sprites[0].changePosition(
			collisionBox.left,
			collisionBox.bottom,
			collisionBox.far,
			time);
		this.sprites[1].changeSize(collisionBox.width, collisionBox.depth, time);
		this.sprites[1].changePosition(
			collisionBox.left,
			collisionBox.top,
			collisionBox.close,
			time);
		this.sprites[2].changeSize(collisionBox.width, collisionBox.height, time);
		this.sprites[2].changePosition(
			collisionBox.right,
			collisionBox.top,
			collisionBox.close,
			time);
		this.sprites[3].changeSize(collisionBox.width, collisionBox.height, time);
		this.sprites[3].changePosition(
			collisionBox.left,
			collisionBox.top,
			collisionBox.far,
			time);
		this.sprites[4].changeSize(collisionBox.depth, collisionBox.height, time);
		this.sprites[4].changePosition(
			collisionBox.right,
			collisionBox.top,
			collisionBox.far,
			time);
		this.sprites[5].changeSize(collisionBox.depth, collisionBox.height, time);
		this.sprites[5].changePosition(
			collisionBox.left,
			collisionBox.top,
			collisionBox.close,
			time);		
	}

	changeActive(value) {
		if (this.active !== value) {
			this.active = value;
			for (let i = 0; i < this.sprites.length; i++) {
				this.sprites[i].changeActive(this.active);
			}			
		}
	}
}