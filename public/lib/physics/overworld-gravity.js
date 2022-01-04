class OverworldGravity extends PhysicsBase {
	async init(sprites, game) {
		this.sprites = sprites.filter(({gravity}) => gravity);
	}

	refresh(time, dt) {
		this.sprites.forEach(sprite => {
			if (sprite.airborne && sprite.acceleration[1] === 0) {
				sprite.changeAcceleration(0, 3000, 0, time);
			}
			const position = sprite.getRealPosition(time);
			if (position[1] >= 400 && sprite.onLand) {
				sprite.onLand(sprite, time);
			}
		});
	}
}