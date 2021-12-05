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
				if (time - sprite.rest < 100 || time - sprite.climbing < 100) {
					sprite.dy = -sprite.jump;
					sprite.rest = 0;
					if (sprite.platform && sprite.platform.onPlatform) {
						sprite.platform.onPlatform(sprite.platform, null);
					}
					sprite.platform = null;
					sprite.climbing = 0;
					recordJump = true;
					sprite.onJump(sprite);
				}
			});
			if (recordJump || time - this.lastJump > 100) {
				this.jump = 0;
			}
		}
	}
}