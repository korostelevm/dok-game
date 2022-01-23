class Movement extends PhysicsBase {
	constructor({speed}) {
		super();
		this.speed = speed || 1;
	}

	async init(sprites) {
		this.sprites = sprites.filter(({movement}) => movement);
		for (let sprite of this.sprites) {
			sprite.dx = 0;
			sprite.dy = 0;
		}
	}

	refresh(time, dt) {
		for (let sprite of this.sprites) {
			const maxBottom = 440;
			const px = Math.max(-30, sprite.x + sprite.dx * sprite.movement * this.speed);
			const py = Math.min(maxBottom, sprite.y + sprite.dy * sprite.movement * this.speed);
			if (py >= maxBottom) {
				sprite.rest = time;
				if (sprite.platform && sprite.platform.onPlatform) {
					sprite.platform.onPlatform(sprite.platform, null);
				}
				sprite.platform = null;
			}
			sprite.changePosition(px, py, sprite.z);
		}
	}	
}