class Control8 extends PhysicsBase {
	async init(sprites, game) {
		this.sprites = sprites.filter(({control, onControl}) => control || onControl);

		this.onKeyActions = {
			onLeft: [
			],
			onRight: [
			],
			onUp: [
			],
			onDown: [
			],
			onAction: [
			],
		};

		this.dx = 0;
		this.dy = 0;
		this.action = 0;
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
		};
		this.onDown = e => {
			if (e.type === "keydown") {
				this.dy ++;
			} else {
				this.dy--;
			}			
			this.lastControl = game.engine.lastTime;
			this.forwardEvents("onDown", e);
		}
		this.onAction = e => {
			if (e.type === "keydown") {
				this.action ++
			} else {
				this.action--;
			}
			this.lastControl = game.engine.lastTime;
			this.forwardEvents("onAction", e);			
		};
		game.engine.keyboardHandler.addKeyDownListener(['a','ArrowLeft'], this.onLeft);
		game.engine.keyboardHandler.addKeyUpListener(['a','ArrowLeft'], this.onLeft);
		game.engine.keyboardHandler.addKeyDownListener(['d','ArrowRight'], this.onRight);
		game.engine.keyboardHandler.addKeyUpListener(['d','ArrowRight'], this.onRight);
		game.engine.keyboardHandler.addKeyDownListener(['w','ArrowUp'], this.onUp);
		game.engine.keyboardHandler.addKeyUpListener(['w','ArrowUp'], this.onUp);
		game.engine.keyboardHandler.addKeyDownListener(['s','ArrowDown'], this.onDown);
		game.engine.keyboardHandler.addKeyUpListener(['s','ArrowDown'], this.onDown);
		game.engine.keyboardHandler.addKeyDownListener([' ', 'Shift'], this.onAction);
		game.engine.keyboardHandler.addKeyUpListener([' ', 'Shift'], this.onAction);

		for (let sprite of this.sprites) {
			for (let event in this.onKeyActions) {
				if (sprite[event]) {
					this.onKeyActions[event].push(sprite);
				}
			}
		}
	}

	forwardEvents(action, e) {
		const sprites = this.onKeyActions[action];
		for (let sprite of sprites) {
			sprite[action](sprite, e);
		}
	}

	onExit(game) {
		game.engine.keyboardHandler.removeListener(this.onLeft);
		game.engine.keyboardHandler.removeListener(this.onRight);
		game.engine.keyboardHandler.removeListener(this.onUp);
		game.engine.keyboardHandler.removeListener(this.onDown);
	}

	refresh(time, dt) {
		for (let i = 0; i < this.sprites.length; i++) {
			const sprite = this.sprites[i];
			const acceleration = Math.max(.5, Math.min(1.5, (time - this.lastControl) / 150));
			const dist = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
			sprite.dx += this.dx * (sprite.control||0) * acceleration / dist;
			sprite.dy += this.dy * (sprite.control||0) * acceleration / dist;
			if (dist < 0.01) {
				sprite.dx = 0;
				sprite.dy = 0;
			}
			if (time - this.lastControl < 50) {
				sprite.onControl(sprite, this.dx, this.dy);
			}
		}
	}
}