class Gravity extends PhysicsBase {
	async init(sprites, game) {
		this.sprites = sprites.filter(({gravity}) => gravity);
	}

	onExit(game) {
		game.engine.keyboardHandler.removeListener(this.onUp);
	}

	refresh(time, dt) {
		this.sprites.forEach(sprite => {
			if (time - sprite.climbing < 100) {
				return;
			}

			const floatFactor = (time - sprite.floating < 300 || sprite.bouncing) ? 1 : 0;
			if (!floatFactor && sprite.dy < 0) {
				sprite.dy /= 2;
			}
			sprite.dy += sprite.gravity * (sprite.dy < 0 ? 1 : 2.5 - floatFactor);
			sprite.dy = Math.min(sprite.dy, 9);
		});
	}
}