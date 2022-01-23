class Control extends PhysicsBase {
	async init(sprites, game) {
		this.sprites = sprites.filter(({control}) => control);

		this.onKeyActions = {
			onLeft: [
			],
			onRight: [
			],
			onUp: [
			],
			onDown: [
			],
			onJumpControl: [
			],
		};

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
			this.forwardEvents("onLeft", e);
		};
		this.onRight = e => {
			if (e.type === "keydown") {
				this.dx ++;
			} else {
				this.dx--;
			}
			this.lastControl = game.engine.lastTime;
			this.forwardEvents("onRight", e);
		};
		this.onUp = e => {
			if (e.type === "keydown") {
				this.dy --;
			} else {
				this.dy++;
			}			
			this.lastControl = game.engine.lastTime;
			this.forwardEvents("onUp", e);
		}
		this.onDown = e => {
			if (e.type === "keydown") {
				this.dy ++;
			} else {
				this.dy--;
			}			
			this.lastControl = game.engine.lastTime;
			this.forwardEvents("onDown", e);
		}
		this.onJump = e => {
			if (e.type === "keydown") {
				this.dy --;
			} else {
				this.dy++;
			}			
			this.lastControl = game.engine.lastTime;
			this.forwardEvents("onJumpControl", e);
		}
		game.engine.keyboardHandler.addKeyDownListener(['a','ArrowLeft'], this.onLeft);
		game.engine.keyboardHandler.addKeyUpListener(['a','ArrowLeft'], this.onLeft);
		game.engine.keyboardHandler.addKeyDownListener(['d','ArrowRight'], this.onRight);
		game.engine.keyboardHandler.addKeyUpListener(['d','ArrowRight'], this.onRight);
		game.engine.keyboardHandler.addKeyDownListener(['w','ArrowUp'], this.onUp);
		game.engine.keyboardHandler.addKeyUpListener(['w','ArrowUp'], this.onUp);
		game.engine.keyboardHandler.addKeyDownListener(['s','ArrowDown'], this.onDown);
		game.engine.keyboardHandler.addKeyUpListener(['s','ArrowDown'], this.onDown);
		game.engine.keyboardHandler.addKeyDownListener(' ', this.onJump);
		game.engine.keyboardHandler.addKeyUpListener(' ', this.onJump);

		for (let sprite of this.sprites) {
			for (let event in this.onKeyActions) {
				if (sprite[event]) {
					this.onKeyActions[event].push(sprite);
				}
			}			
		}
	}

	forwardEvents(action, e) {
		for (let sprite of this.onKeyActions[action]) {
			sprite[action](sprite, e);
		}
	}

	onExit(game) {
		game.engine.keyboardHandler.removeListener(this.onLeft);
		game.engine.keyboardHandler.removeListener(this.onRight);
		game.engine.keyboardHandler.removeListener(this.onUp);
		game.engine.keyboardHandler.removeListener(this.onDown);
		game.engine.keyboardHandler.removeListener(this.onJump);
	}

	refresh(time, dt) {
		for (let i = 0; i < this.sprites.length; i++) {
			const sprite = this.sprites[i];
			if (time - sprite.climbing < 100) {
				sprite.dx += this.dx * sprite.control;
				sprite.dx *= .8;
				if (Math.abs(sprite.dx) < .01 && sprite.dx !== 0) {
					sprite.dx = 0;
				}
				sprite.dy += this.dy * sprite.control * .3;
				sprite.dy *= .8;
				if (Math.abs(sprite.dy) < .01 && sprite.dy !== 0) {
					sprite.dy = 0;
				}
				if (time - this.lastControl < 50) {
					sprite.onControl(sprite, this.dx, this.dy);
				}
				continue;
			}

			const acceleration = sprite.crouch ? 1.5 : Math.max(.5, Math.min(1.5, (time - this.lastControl) / 150));
			sprite.dx += this.dx * sprite.control * acceleration;
			sprite.dx *= sprite.rest ? (sprite.crouch || !this.dx ? .3 : .72) : sprite.dy < 0 ? .76 : .8;
			if (Math.abs(sprite.dx) < .01 && sprite.dx !== 0) {
				sprite.dx = 0;
			}
			if (!sprite.jump || time - sprite.jump > 500) {
				if (sprite.climb && time - sprite.climb < 200) {
					sprite.dy += Math.sign(this.dy) * 2 * sprite.control;
					sprite.dy *= .7;
				}
			}
			if (time - this.lastControl < 50) {
				sprite.onControl(sprite, this.dx, this.dy);
			}
		}
	}
}