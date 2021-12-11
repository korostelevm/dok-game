class SpriteMapper {
	constructor(game, spriteFactory, atlas, control, audio, jump) {
		this.spriteFactory = spriteFactory;
		this.atlas = atlas;
		this.control = control;
		this.jump = jump;
		this.audio = audio;
		this.game = game;
	}

	async init(engine) {
		const onMotion = (self, dx, dy) => {
			const still = dx === 0;
			const time = self.engine.lastTime;
			const climbing = time - self.climbing < 100;
			const climbingStill = climbing && self.dx === 0 && self.dy === 0;
			const jumping = time - self.lastJump < 300;
			const crouchingStill = self.crouch && dx === 0;
			self.changeAnimation(climbingStill ? this.atlas.hero.climb_still
				: climbing ? this.atlas.hero.climb
				: jumping ? this.atlas.hero.jump
				: crouchingStill ? this.atlas.hero.crouch_still
				: self.crouch ? this.atlas.hero.crouch
				: still ? this.atlas.hero.still
				: this.atlas.hero.run);
			if (dx !== 0) {
				self.changeDirection(dx < 0 ? -1 : 1);
			}
		};

		this.map = {
			'8': (col, row, option) => {
				return this.spriteFactory.create({
					name: "hero",
					anim: this.atlas.hero.still,
					size: [50, 75],
					hotspot: [25, 75],
					x: 40 * col, y: 40 * row, z: -1,
					remember: true,
				}, {
					gravity: .2,
					motion: 1,
					collide: 1,
					jump: 4.8,
					control: 1,
					onEnter: (self, sprite) => {
						if (sprite.npc) {
							self.engine.showMessage(self.id, `press [E] to start dialog`);
							this.game.camera = "zoom";
						}
					},
					onLeave: (self, sprite) => {
						if (sprite.npc) {
							self.engine.clearMessage(self.id);
							if (!self.engine.getMessage()) {
								this.game.camera = "normal";
							}
						}
						if (sprite.ladder && !self.touchingLadder) {
							const jumping = self.engine.lastTime - self.lastJump < 100;
							if (this.control.dy < 0 && !jumping) {
								this.jump.performJump(self);
							}
							if (self.climbing) {
								self.climbing = 0;
								onMotion(self, this.control.dx, this.control.dy);
							}
						}
					},
					preCollisionCheck: (self) => {
						self.touchingLadder = false;
					},
					onCollide: (self, sprite, xPush, yPush) => {
						if (sprite.ladder && !self.climbing && self.dy > 0) {
							self.climbing = self.engine.lastTime;
							self.dy = 0;
							self.dx = 0;
							self.changePosition(sprite.getCenterX(), self.y);
							onMotion(self, this.control.dx, this.control.dy);
						}

						if (self.climbing && sprite.ladder) {
							self.climbing = self.engine.lastTime;
							if (!self.touchingLadder) {
								self.touchingLadder = true;
								onMotion(self, this.control.dx, this.control.dy);
							}
							return;
						}

						if (sprite.noblock) {
							return;
						}

						if (sprite.bounce) {
							if (self.dy > 0) {
								self.lastJump = self.engine.lastTime;
								self.dy = -self.dy * (this.control.dy < 0 ? 1.3 : 1);
								self.changePosition(self.x, self.y + self.dy);
								self.bouncing = self.engine.lastTime;
								sprite.changeAnimation(this.atlas.debugBounceBouncing);
								sprite.bounced = self.engine.lastTime;
								sprite.engine.addRefresh(sprite);
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
								onMotion(self, this.control.dx, this.control.dy);
							}

							if (sprite.lowceiling && yPush > 0 && self.rest && !self.crouch) {
								self.crouch = self.engine.lastTime;
								return;
							}

							self.changePosition(self.x, self.y + yPush);
							//	push from bottom
							if (yPush < 0) {
								self.lastJump = 0;
								if (!self.rest) {
									onMotion(self, this.control.dx, this.control.dy);
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
							self.changePosition(self.x + xPush, self.y);
							if (sprite.canLand && self.dy < .2 && self.dy > 0 && self.collisionBox.top < sprite.collisionBox.top) {
								self.climb = self.engine.lastTime;
								self.climbSide = xPush < 0 ? 1 : -1;
							}
						}
					},
					onControl: (self, dx, dy) => {
						onMotion(self, dx, dy);
					},
					onJump: (self) => {
						self.changePosition(self.x, self.y - self.jump);
						self.lastJump = self.engine.lastTime;
						onMotion(self, 0, 0);
					},
					onUp: (self, e) => {
						self.crouch = 0;
						self.floating = e.type === "keydown" ? self.engine.lastTime : 0;
					},
					onJumpControl: (self, e) => {
						self.floating = e.type === "keydown" ? self.engine.lastTime : 0;
					},
					onDown: (self, e) => {
						if (e.type === "keyup") {
							self.crouch = 0;
						} else if (self.rest) {
							self.crouch = self.engine.lastTime;
						}
					},
				});
			},
			'[': (col, row, option) => {
				return this.spriteFactory.create({
					name: `block_${col}_${row}`,
					anim: this.atlas.debugBlock,
					size: [40, 40],
					x: 40 * col, y: 40 * row,
				}, {
					block: 1,
					collide: 1,
					init: (self, col, row, grid) => {
						if (!grid[row-1] || !grid[row-1][col] || !grid[row-1][col].block) {
							self.canLand = true;
							self.changeOpacity(.7);
						}
						if (!grid[row+1] || !grid[row+1][col] || !grid[row+1][col].block) {
							self.ceiling = true;
						}
					},
					onPlatform: (self, lander) => {
						self.changeAnimation(lander ? this.atlas.debugBlockHighlight : this.atlas.debugBlock);
					},
				});
			},
			'V': (col, row, option) => {
				return this.spriteFactory.create({
					name: `crate_${col}_${row}`,
					anim: this.atlas.debugCrate,
					size: [40, 40],
					x: 40 * col, y: 40 * row,
				}, {
					collide: 1, crate: 1, canLand: true,
				});
			},
			'H': (col, row, option) => {
				return this.spriteFactory.create({
					name: `ladder_${col}_${row}`,
					anim: this.atlas.debugLadder,
					size: [40, 40],
					x: 40 * col, y: 40 * row,
				}, {
					collide: 1, ladder: 1, canLand: true,
				});
			},
			'-': (col, row, option) => {
				if (!this.movingPlatform) {
					this.movingPlatform = this.spriteFactory.create({
						name: `mover_${col}_${row}`,
						anim: this.atlas.debugMovingPlatform,
						size: [80, 40],
						x: 40 * col, y: 40 * row,
					}, {
						path: [],
						collide: 1, canLand: true,
						index: 0,
						speed: 2,
						onPlatform: (self, lander) => {
							self.lander = lander;
						},
						onRefresh: platform => {
							const nextSpot = platform.path[platform.index];
							const dx = nextSpot.x - platform.x;
							const dy = nextSpot.y - platform.y;
							const dist = Math.sqrt(dx * dx + dy * dy);
							const speed = Math.min(dist, platform.speed);
							const ddx = dist < 0.1 ? dx : dx / dist * speed;
							const ddy = dist < 0.1 ? dy : dy / dist * speed;
							platform.changePosition(platform.x + ddx, platform.y + ddy);
							const lander = platform.lander;
							if (lander) {
								lander.changePosition(lander.x + ddx, lander.y + ddy);
							}
							if (dist < 0.1) {
								platform.index = (platform.index + 1) % platform.path.length;
							}
						},
					});
				}
				const index = parseInt(option);
				this.movingPlatform.path[index] = {
					x: 40 * col, y: 40 * row,
				};
				if (index === 0) {
					this.movingPlatform.changePosition(40 * col, 40 * row);
					return this.movingPlatform;
				}
			},
			'^': (col, row, option) => {
				return this.spriteFactory.create({
					name: `lowceiling_${col}_${row}`,
					anim: this.atlas.debugCeiling,
					size: [40, 40],
					x: 40 * col, y: 40 * row,
				}, {
					collide: 1, lowceiling: 1,
					init: (self, col, row, grid) => {
						if (!grid[row-1] || !grid[row-1][col] || !grid[row-1][col].block) {
							self.canLand = true;
							self.changeOpacity(.7);
						}
					},
				});				
			},
			'?': (col, row, option) => {
				return this.spriteFactory.create({
					name: `npc_${col}_${row}`,
					anim: this.atlas.npc.still,
					size: [40, 40],
					x: 40 * col, y: 40 * row,
				}, {
					collide: 1, npc: 1, noblock: 1,
				});
			},
			'$': (col, row, option) => {
				return this.spriteFactory.create({
					name: `coin_${col}_${row}`,
					anim: this.atlas.debugCoin,
					size: [40, 40],
					x: 40 * col, y: 40 * row,
				}, {
					collide: 1, coin: 1, noblock: 1,
					onCollide: (self, sprite, xPush, yPush) => {
						if (self.properties.pickedUp) {
							return;
						}
						self.setProperty("pickedUp", self.engine.lastTime);
					},
					onChange: {
						pickedUp: (coin, value, isInit) => {
							if (value) {
								if (!isInit) {
									this.audio.pickup.play();
								}
								coin.setActive(false);
							}
						},
					},
				});
			},
			'@': (col, row, option) => {
				return this.spriteFactory.create({
					name: `bounce_${col}_${row}`,
					anim: this.atlas.debugBounce,
					size: [40, 40],
					x: 40 * col, y: 40 * row,
				}, {
					collide: 1, bounce: 1, manualRefresh: true,
					onRefresh: self => {
						if (self.engine.lastTime - self.bounced > 1000) {
							self.changeAnimation(this.atlas.debugBounce);
							self.engine.removeRefresh(self);
						}
					},
				});
			},
		};
	}

	createBlock(col, row, type, option) {
		const generator = this.map[type];
		if (generator) {
			return generator.call(this, col, row, option);
		}
		return null;
	}
}