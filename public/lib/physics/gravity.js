class Gravity extends PhysicsBase {
	async init(sprites, game) {
		this.sprites = sprites.filter(({gravity}) => gravity);
		this.jump = 1;
		this.onJump = e => {
			this.jump = e.type === "keydown" ? 1 : 0;
		};
		game.engine.keyboardHandler.addKeyDownListener('w', this.onJump);
		game.engine.keyboardHandler.addKeyUpListener('w', this.onJump);
	}

	onExit(game) {
		game.engine.keyboardHandler.removeListener(this.onJump);
	}

	refresh(time, dt) {
		this.sprites.forEach(sprite => {
			sprite.dy += sprite.gravity * (sprite.dy < 0 ? 1 : 1.5 - this.jump);
		});
	}
}