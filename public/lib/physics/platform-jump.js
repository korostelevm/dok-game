class PlatformJump extends PhysicsBase {
	constructor({strength}) {
		super();
		this.strength = strength || 1;
	}

	async init(sprites, game) {
		this.sprites = sprites.filter(({jump}) => jump);

		this.jump = 0;
		this.up = 0;
		this.onJump = e => {
			if (!this.jump) {
				this.jump = game.engine.lastTime;
			}
		};
		this.onUp = e => {
			if (!this.up) {
				this.up = game.engine.lastTime;
			}
		};
		game.engine.keyboardHandler.addKeyDownListener(' ', this.onJump);
		game.engine.keyboardHandler.addKeyDownListener(['w','ArrowUp'], this.onUp);
	}

	onExit(game) {
		game.engine.keyboardHandler.removeListener(this.onJump);
	}

	performJump(sprite, strength) {
		sprite.dy = -sprite.jump * strength;
		sprite.rest = 0;
		if (sprite.platform && sprite.platform.onPlatform) {
			sprite.platform.onPlatform(sprite.platform, null);
		}
		sprite.platform = null;
		sprite.climbing = 0;
		sprite.onJump(sprite);
	}

	refresh(time, dt) {
		let recordJump = false;
		for (let sprite of this.sprites) {
			if (!this.jump && (!this.up || !sprite.rest)) {
				return;
			}
			if (time - sprite.rest < 150 || time - sprite.climbing < 100) {
				this.performJump(sprite, this.strength);
				recordJump = true;
			}
		}
		if (recordJump || time - this.jump > 100) {
			this.jump = 0;
		}
		if (recordJump || time - this.up > 100) {
			this.up = 0;
		}
	}
}