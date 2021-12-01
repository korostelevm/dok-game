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
			const px = sprite.x + sprite.dx * sprite.motion;
			const py = sprite.y + sprite.dy * sprite.motion;
			sprite.changePosition(px, py);
		});
	}	
}