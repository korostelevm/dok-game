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
			const px = Math.max(-30, sprite.x + sprite.dx * sprite.motion);
			const py = Math.min(360, sprite.y + sprite.dy * sprite.motion);
			if (py >= 360) {
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