class Jump extends PhysicsBase {
	async init(sprites, game) {
		this.sprites = sprites.filter(({jump}) => jump);

		this.jump = 0;
		this.onJump = e => {
			if (!this.jump) {
				this.jump = game.engine.lastTime;
			}
		};
		game.engine.keyboardHandler.addKeyDownListener(' ', this.onJump);
	}

	onExit(game) {
		game.engine.keyboardHandler.removeListener(this.onJump);
	}

	refresh(time, dt) {
		if (this.jump) {
			let recordJump = false;
			this.sprites.forEach(sprite => {
				if (sprite.rest && time - sprite.rest < 100) {
					sprite.dy = -sprite.jump;
					sprite.rest = 0;
					recordJump = true;
					sprite.onJump(sprite);
				}
			});
			if (recordJump || time - this.jump > 100) {
				this.jump = 0;
			}
		}
	}
}