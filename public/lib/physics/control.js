class Control extends PhysicsBase {
	async init(sprites, game) {
		this.sprites = sprites.filter(({control}) => control);

		this.dx = 0;
		this.dy = 0;
		this.lastControl = 0;
		this.onLeft = e => {
			if (e.type === "keydown") {
				this.dx --;
			} else {
				this.dx++;
			}
			this.lastControl = game.engine.lastTime;
		};
		this.onRight = e => {
			if (e.type === "keydown") {
				this.dx ++;
			} else {
				this.dx--;
			}
			this.lastControl = game.engine.lastTime;
		};
		this.onUp = e => {
			if (e.type === "keydown") {
				this.dy --;
			} else {
				this.dy++;
			}			
			this.lastControl = game.engine.lastTime;
		}
		game.engine.keyboardHandler.addKeyDownListener('a', this.onLeft);
		game.engine.keyboardHandler.addKeyUpListener('a', this.onLeft);
		game.engine.keyboardHandler.addKeyDownListener('d', this.onRight);
		game.engine.keyboardHandler.addKeyUpListener('d', this.onRight);
		game.engine.keyboardHandler.addKeyDownListener(' ', this.onUp);
		game.engine.keyboardHandler.addKeyUpListener(' ', this.onUp);
	}

	onExit(game) {
		game.engine.keyboardHandler.removeListener(this.onLeft);
		game.engine.keyboardHandler.removeListener(this.onRight);
		game.engine.keyboardHandler.removeListener(this.onUp);
	}

	refresh(time, dt) {
		this.sprites.forEach(sprite => {
			sprite.dx += this.dx * sprite.control;
			sprite.dx *= sprite.rest ? .8 : .85;
			if (Math.abs(sprite.dx) < .01 && sprite.dx !== 0) {
				sprite.dx = 0;
			}
			if (time - this.lastControl < 50) {
				sprite.onControl(sprite, this.dx);
			}
			if (!sprite.jump || time - sprite.jump > 500) {
				if (sprite.climb && time - sprite.climb < 200) {
					sprite.lastClimb = time;
					sprite.dy += this.dy * sprite.control;
					sprite.dy *= .7;
				}
			}
		});
	}
}