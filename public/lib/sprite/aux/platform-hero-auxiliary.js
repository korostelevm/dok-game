const LEFT_SUFFIX = "_left";

class PlatformHeroAuxiliary extends Auxiliary {
	constructor(config) {
		super(config);
	}

	decorate(sprite) {
		sprite.collisionBox.showCollisionBox = sprite.engine.debug;
		sprite.gravity = this.config.gravity || .2;
		sprite.movement = 1;
		sprite.collide = 1;
		sprite.jump = this.config.jump || 4.8;
		sprite.control = 1;
		sprite.onEnter = (self, sprite) => this.onEnter(self, sprite);
		sprite.onLeave = (self, sprite) => this.onLeave(self, sprite);
		sprite.onCollide = (self, sprite, xPush, yPush) => this.onCollide(self, sprite, xPush, yPush);
		sprite.onControl = (self, dx, dy) => this.onControl(self, dx, dy);
		sprite.onJump = self => this.onJump(self);
		sprite.onUp = (self, e) => this.onUp(self, e);
		sprite.onJumpControl = (self, e) => this.onJumpControl(self, e);
		sprite.onDown = (self, e) => this.onDown(self, e);
	}

	onEnter(self, sprite) {
		if (sprite.onChat) {
			sprite.onChatEvent = e => {
				sprite.onChat(sprite, self);
				self.engine.clearMessage(self.id);
			};

			self.engine.showMessage(self.id, `press [Q] to start dialog`);
			self.engine.keyboardHandler.addKeyDownListener('q', sprite.onChatEvent);
		}
		if (sprite.onOpen) {
			sprite.onOpenEvent = e => {
				self.changePosition(sprite.getCenterX(), self.y, self.z);
				sprite.onOpen(sprite, self);
				self.engine.clearMessage(self.id);
			};

			self.engine.showMessage(self.id, `press [Q] to start open ${sprite.name}`);
			self.engine.keyboardHandler.addKeyDownListener('q', sprite.onOpenEvent);							
		}
	}

	onLeave (self, sprite) {
		if (sprite.onChat) {
			if (self.chatting) {
				sprite.onChat(sprite, self, false);
			}
			self.engine.clearMessage(self.id);
			self.engine.keyboardHandler.removeListener(sprite.onChatEvent);
			self.game.camera = "normal";
		}
		if (sprite.onOpen) {
			sprite.setProperty("opened", 0);
			self.engine.clearMessage(self.id);
			self.engine.keyboardHandler.removeListener(sprite.onOpenEvent);
			self.game.camera = "normal";
		}
		if (sprite.ladder) {
			const jumping = self.engine.lastTime - self.lastJump < 100;
			if (self.game.jump && self.game.control.dy < 0 && !jumping) {
				self.game.jump.performJump(self);
			}
			if (self.climbing) {
				self.climbing = 0;
				this.onMotion(self, self.game.control.dx, self.game.control.dy);
			}
		}
	}

	onCollide(self, sprite, xPush, yPush) {
		if (sprite.ladder && !self.climbing && self.dy > 0) {
			self.climbing = self.engine.lastTime;
			self.dy = 0;
			self.dx = 0;
			self.changePosition(sprite.getCenterX(), self.y, self.z);
			this.onMotion(self, self.game.control.dx, self.game.control.dy);
			return;
		}

		if (self.climbing && sprite.ladder) {
			self.climbing = self.engine.lastTime;
			this.onMotion(self, self.game.control.dx, self.game.control.dy);
			return;
		}

		if (sprite.noblock) {
			return;
		}

		if (sprite.bounce) {
			if (self.dy > 0) {
				self.lastJump = self.engine.lastTime;
				self.dy = -self.dy * (self.game.control.dy < 0 ? 1.3 : 1);
				self.changePosition(self.x, self.y + self.dy, self.z);
				self.bouncing = self.engine.lastTime;
				self.lastJump = self.engine.lastTime;
				sprite.changeAnimation(self.game.atlas.debugBounceBouncing);
				sprite.bounced = self.engine.lastTime;
				this.onMotion(self, self.game.control.dx, self.game.control.dy);
				sprite.engine.refresher.add(sprite);
			}
			return;
		}

		//	VERTICAL COLLIDE
		if (Math.abs(yPush) < Math.abs(xPush)) {
			if (sprite.ladder || sprite.crate) {
				if (self.dy <= 0 || yPush > 0) {
					return;
				}
			}

			if (sprite.canLand && self.dy > 0 || sprite.ceiling && self.dy < 0) {
				self.dy = 0;
				self.bouncing = 0;
				this.onMotion(self, self.game.control.dx, self.game.control.dy);
			}

			if (sprite.lowceiling && yPush > 0 && self.rest && !self.crouch) {
				self.crouch = self.engine.lastTime;
				return;
			}

			self.changePosition(self.x, self.y + yPush, self.z);
			//	push from bottom
			if (yPush < 0) {
				self.lastJump = 0;
				if (!self.rest) {
					this.onMotion(self, self.game.control.dx, self.game.control.dy);
				}
				if (sprite.canLand) {
					self.rest = self.engine.lastTime;
					if (self.platform !== sprite) {
						if (self.platform && self.platform.onPlatform) {
							self.platform.onPlatform(self.platform, null);
						}
						self.platform = sprite;
						if (self.platform.onPlatform) {
							//	TODO: Optimize. Right now, this gets called every frame when colliding two platforms.
							self.platform.onPlatform(self.platform, self);
						}
					}
				}
			}
		} else {
			if (sprite.ladder || sprite.crate) {
				return;
			}
			self.dx += xPush;
			self.changePosition(self.x + xPush, self.y, self.z);
			if (sprite.canLand && self.dy < .2 && self.dy > 0 && self.collisionBox.top < sprite.collisionBox.top) {
				self.climb = self.engine.lastTime;
				self.climbSide = xPush < 0 ? 1 : -1;
			}
		}
	}

	onControl(self, dx, dy) {
		this.onMotion(self, dx, dy);
	}

	onJump(self) {
		if (self.crouch) {
			self.lastJump = 0;
			this.onMotion(self, 0, 0);
			return;
		}
		self.changePosition(self.x, self.y - self.jump, self.z);
		self.lastJump = self.engine.lastTime;
		this.onMotion(self, 0, 0);
	}

	onUp(self, e) {
		self.crouch = 0;
		self.floating = e.type === "keydown" ? self.engine.lastTime : 0;
	}

	onJumpControl(self, e) {
		self.floating = e.type === "keydown" ? self.engine.lastTime : 0;
	}

	onDown(self, e) {
		if (e.type === "keyup") {
			self.crouch = 0;
		} else if (self.rest) {
			self.crouch = self.engine.lastTime;
		}
	}

	onMotion(self, dx, dy) {
		const still = dx === 0;
		const time = self.engine.lastTime;
		const climbing = time - self.climbing < 100;
		const climbingStill = climbing && self.dx === 0 && self.dy === 0;
		const jumping = time - self.lastJump < 300;
		const crouchingStill = self.crouch && dx === 0;
		let animName = climbingStill ? "climb_still"
			: climbing ? "climb"
			: jumping ? "jump"
			: crouchingStill ? "crouch_still"
			: self.crouch ? "crouch"
			: still ? "still"
			: "run";
		if (dx !== 0) {
			self.dir = dx;
		}
		if (self.dir < 0) {
			if (self.game.atlas.hero[animName + LEFT_SUFFIX]) {
				animName += LEFT_SUFFIX;
			} else {
				self.changeDirection(-1);
			}
		} else {
			self.changeDirection(1);				
		}
		const anim = self.game.atlas.hero[animName];

		self.changeAnimation(anim);
	}
}