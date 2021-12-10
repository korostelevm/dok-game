class Movement extends PhysicsBase {
	async init(sprites) {
		this.sprites = sprites.filter(({motion}) => motion);
		this.sprites.forEach(sprite => {
			sprite.dx = 0;
			sprite.dy = 0;
		});
	}

	refresh(time, dt) {
		this.sprites.forEach(sprite => {
			const maxBottom = 440;
			const px = Math.max(-30, sprite.x + sprite.dx * sprite.motion);
			const py = Math.min(maxBottom, sprite.y + sprite.dy * sprite.motion);
			if (py >= maxBottom) {
				sprite.rest = time;
				if (sprite.platform && sprite.platform.onPlatform) {
					sprite.platform.onPlatform(sprite.platform, null);
				}
				sprite.platform = null;
			}
			sprite.changePosition(px, py);
		});
	}	
}