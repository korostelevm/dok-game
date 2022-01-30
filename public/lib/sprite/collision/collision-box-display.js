class CollisionBoxDisplay {
	constructor(collisionBox, opacity) {
		this.collisionBox = collisionBox;
		const game = collisionBox.sprite.game;
		this.engine = game.engine;
		this.active = true;
		this.sprites = [
			this.generateBox(game, collisionBox, [90, 0 ,0], opacity),
			this.generateBox(game, collisionBox, [-90, 0 ,0], opacity),
			this.generateBox(game, collisionBox, [0, 180 ,0], opacity),
			this.generateBox(game, collisionBox, [0, 0 ,0], opacity),
			this.generateBox(game, collisionBox, [0, 90 ,0, opacity]),
			this.generateBox(game, collisionBox, [0, -90 ,0], opacity),
		];

		this.engine.refresher.add(this);
	}

	onRefresh(self, time) {
		this.repositionSprites(time);
	}

	generateBox(game, collisionBox, rotation, opacity) {
		const { x, y, z } = collisionBox.sprite;
		return game.spriteFactory.create({
			anim: game.atlas.collisionBox,
			size: [1, 1],
			x, y, z,
			rotation,
			opacity: opacity || 1,
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
			for (let sprite of this.sprites) {
				sprite.changeActive(value);
			}
		}
	}
}