class OverworldGravity extends PhysicsBase {
	constructor(config) {
		super();
		this.gravity = config?.gravity ?? 1;
		this.ground = config?.ground ?? 400;
	}

	async init(sprites, game) {
		this.sprites = sprites.filter(({gravity}) => gravity);
	}

	refresh(time, dt) {
		this.sprites.forEach(sprite => {
			if (sprite.airborne && sprite.acceleration[1] === 0) {
				sprite.changeAcceleration(0, 3000 * this.gravity, 0, time);
			}
			const position = sprite.getRealPosition(time);
			if (position[1] > this.ground && sprite.onLand) {
				sprite.onLand(sprite, time, this.ground);
			}
		});
	}
}