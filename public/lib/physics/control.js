class Control extends PhysicsBase {
	async init(sprites, game) {
		this.sprites = sprites.filter(({control}) => control);

		this.dx = 0;
		this.onLeft = e => {
			if (e.type === "keydown") {
				this.dx --;
			} else {
				this.dx++;
			}
		};
		this.onRight = e => {
			if (e.type === "keydown") {
				this.dx ++;
			} else {
				this.dx--;
			}
		};
		game.engine.keyboardHandler.addKeyDownListener('a', this.onLeft);
		game.engine.keyboardHandler.addKeyDownListener('d', this.onRight);
		game.engine.keyboardHandler.addKeyUpListener('a', this.onLeft);
		game.engine.keyboardHandler.addKeyUpListener('d', this.onRight);
	}

	onExit(game) {
		game.engine.keyboardHandler.removeListener(this.onLeft);
		game.engine.keyboardHandler.removeListener(this.onRight);
	}

	refresh(time, dt) {
		this.sprites.forEach(sprite => {
			sprite.dx += this.dx * sprite.control;
			sprite.dx *= sprite.rest ? .7 : .8;
			if (Math.abs(sprite.dx) < .01) {
				sprite.dx = 0;
			}
		});
	}
}