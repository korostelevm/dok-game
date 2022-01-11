class PlatformGravity extends PhysicsBase {
	constructor(config) {
		super();
		this.gravity = config?.gravity ?? 1;
	}

	async init(sprites, game) {
		this.sprites = sprites.filter(({gravity}) => gravity);
	}

	refresh(time, dt) {
		this.sprites.forEach(sprite => {
			if (time - sprite.climbing < 150) {
				return;
			}

			const floatFactor = (time - sprite.floating < 300 || sprite.bouncing) ? 1 : 0;
			if (!floatFactor && sprite.dy < 0) {
				sprite.dy /= 2;
			}
			sprite.dy += sprite.gravity * (sprite.dy < 0 ? 1 : 2.5 - floatFactor) * this.gravity;
			sprite.dy = Math.min(sprite.dy, 9);
		});
	}
}