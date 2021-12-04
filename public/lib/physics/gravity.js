class Gravity extends PhysicsBase {
	async init(sprites, game) {
		this.sprites = sprites.filter(({gravity}) => gravity);
		this.floating = 1;
		this.onUp = e => {
			this.floating = e.type === "keydown" ? game.engine.lastTime : 0;
		};
		game.engine.keyboardHandler.addKeyDownListener('w', this.onUp);
		game.engine.keyboardHandler.addKeyUpListener('w', this.onUp);
	}

	onExit(game) {
		game.engine.keyboardHandler.removeListener(this.onUp);
	}

	refresh(time, dt) {
		this.sprites.forEach(sprite => {
			const floatFactor = this.floating && time - this.floating < 300 ? 1 : 0;
			if (!this.floating && sprite.dy < 0) {
				sprite.dy /= 2;
			}
			sprite.dy += sprite.gravity * (sprite.dy < 0 ? 1 : 2.5 - floatFactor);
			sprite.dy = Math.min(sprite.dy, 10);
		});
	}
}