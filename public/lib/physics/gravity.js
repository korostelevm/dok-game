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
			const floatFactor = this.floating && time - this.floating < 300 ? 1 : 0
			sprite.dy += sprite.gravity * (sprite.dy < 0 ? 1 : 2 - floatFactor);
		});
	}
}