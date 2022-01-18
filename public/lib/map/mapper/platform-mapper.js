class PlatformMapper extends SpriteMapper {
	constructor(game) {
		super(game);
		this.control = game.control;
	}

	async init(engine) {
		const LEFT_SUFFIX = "_left";
		const onMotion = (self, dx, dy) => {
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
				if (this.atlas.hero[animName + LEFT_SUFFIX]) {
					animName += LEFT_SUFFIX;
				} else {
					self.changeDirection(-1);
				}
			} else {
				self.changeDirection(1);				
			}
			const anim = this.atlas.hero[animName];

			self.changeAnimation(anim);
		};

		this.map = {
			...this.map,
			'8': new GeneratorWithCallback((col, row, option) => {
				return this.spriteFactory.create({
					name: "hero",
					anim: this.atlas.hero.still,
					size: [50, 50, 2],
					hotspot: Constants.HOTSPOT_BOTTOM,
					x: 40 * col, y: 40 * row, z: 1,
					remember: true,
					showCollisionBox: engine.debug,
				}, {
					gravity: .2,
					movement: 1,
					collide: 1,
					jump: 4.8,
					control: 1,
					onEnter: (self, sprite) => {
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
					},
					onLeave: (self, sprite) => {
						if (sprite.onChat) {
							if (self.chatting) {
								sprite.stopChat(sprite, self);
							}
							self.engine.clearMessage(self.id);
							self.engine.keyboardHandler.removeListener(sprite.onChatEvent);
							this.game.camera = "normal";
						}
						if (sprite.onOpen) {
							sprite.setProperty("opened", 0);
							self.engine.clearMessage(self.id);
							self.engine.keyboardHandler.removeListener(sprite.onOpenEvent);
							this.game.camera = "normal";
						}
						if (sprite.ladder) {
							const jumping = self.engine.lastTime - self.lastJump < 100;
							if (this.jump && this.control.dy < 0 && !jumping) {
								this.game.jump.performJump(self);
							}
							if (self.climbing) {
								self.climbing = 0;
								onMotion(self, this.control.dx, this.control.dy);
							}
						}
					},
					onCollide: (self, sprite, xPush, yPush) => {
						if (sprite.ladder && !self.climbing && self.dy > 0) {
							self.climbing = self.engine.lastTime;
							self.dy = 0;
							self.dx = 0;
							self.changePosition(sprite.getCenterX(), self.y, self.z);
							onMotion(self, this.control.dx, this.control.dy);
							return;
						}

						if (self.climbing && sprite.ladder) {
							self.climbing = self.engine.lastTime;
							onMotion(self, this.control.dx, this.control.dy);
							return;
						}

						if (sprite.noblock) {
							return;
						}

						if (sprite.bounce) {
							if (self.dy > 0) {
								self.lastJump = self.engine.lastTime;
								self.dy = -self.dy * (this.control.dy < 0 ? 1.3 : 1);
								self.changePosition(self.x, self.y + self.dy, self.z);
								self.bouncing = self.engine.lastTime;
								self.lastJump = self.engine.lastTime;
								sprite.changeAnimation(this.atlas.debugBounceBouncing);
								sprite.bounced = self.engine.lastTime;
								onMotion(self, this.control.dx, this.control.dy);
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
								onMotion(self, this.control.dx, this.control.dy);
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
							self.changePosition(self.x + xPush, self.y, self.z);
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
						if (self.crouch) {
							self.lastJump = 0;
							onMotion(self, 0, 0);
							return;
						}
						self.changePosition(self.x, self.y - self.jump, self.z);
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
			}),
			'[': new GeneratorWithCallback((col, row, option) => {
				return this.spriteFactory.create({
					name: `block_${col}_${row}`,
					anim: this.atlas.debugBlock,
					size: [40, 40],
					x: 40 * col, y: 40 * row,
				}, {
					canMerge: Constants.VERTICAL_MERGE,
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
			}),
			'V': new GeneratorWithCallback((col, row, option) => {
				return this.spriteFactory.create({
					name: `crate_${col}_${row}`,
					anim: this.atlas.debugCrate,
					size: [40, 40],
					x: 40 * col, y: 40 * row,
				}, {
					canMerge: Constants.HORIZONTAL_MERGE,
					collide: 1, crate: 1, canLand: true,
				});
			}),
			'H': new GeneratorWithCallback((col, row, option) => {
				return this.spriteFactory.create({
					name: `ladder_${col}_${row}`,
					anim: this.atlas.debugLadder,
					size: [40, 40],
					x: 40 * col, y: 40 * row,
				}, {
					canMerge: Constants.VERTICAL_MERGE,
					collide: 1, ladder: 1, canLand: true,
				});
			}),
			'-': new GeneratorWithCallback((col, row, option) => {
				if (!this.movingPlatform) {
					this.movingPlatform = this.spriteFactory.create({
						name: `mover_${col}_${row}`,
						anim: this.atlas.debugMovingPlatform,
						size: [40, 40],
						x: 40 * col, y: 40 * row,
					}, {
						path: [],
						collide: 1, canLand: true,
						index: 0,
						speed: 2,
						onCreate: (self, col, row, asciiMap, grid) => {
							let w = 1, h = 1;
							for (let i = 1; asciiMap[row][col+i] === "--"; i++) {
								w ++;
							}
							for (let i = 1; asciiMap[row+i] && asciiMap[row+i][col] === "--"; i++) {
								h ++;
							}
							for (let y = 0; y < h; y++) {
								if (!grid[row + y]) {
									grid[row + y] = [];
								}
								for (let x = 0; x < w; x++) {
									if (!grid[row + y][col + x]) {
										grid[row + y][col + x] = self;
									}
								}
							}


							self.path[self.index].size = [w * 40, h * 40];
						},
						onPlatform: (self, lander) => {
							self.lander = lander;
						},
						onRefresh: platform => {
							const previousSpot = platform.path[(platform.index + platform.path.length - 1) % platform.path.length];
							const nextSpot = platform.path[platform.index];
							const dx = nextSpot.x - platform.x;
							const dy = nextSpot.y - platform.y;
							const dist = Math.sqrt(dx * dx + dy * dy);
							if (dist < 0.0001) {
								platform.index = (platform.index + 1) % platform.path.length;								
								return;
							}
							const lander = platform.lander;

							const speed = Math.min(dist, platform.speed);
							const ddx = dist < 0.1 ? dx : dx / dist * speed;
							const ddy = dist < 0.1 ? dy : dy / dist * speed;

							platform.changePosition(platform.x + ddx, platform.y + ddy, platform.z);

							const xProgressSize = nextSpot.x - previousSpot.x;
							const xProgress = xProgressSize === 0 ? 0 : (platform.x - previousSpot.x) / xProgressSize;
							const yProgressSize = nextSpot.y - previousSpot.y;
							const yProgress = yProgressSize === 0 ? 0 : (platform.y - previousSpot.y) / yProgressSize;
							const progress = (xProgress + yProgress) / ((xProgressSize !== 0 ? 1 : 0) + (yProgressSize !== 0 ? 1 : 0));
							const regress = (1 - progress);
							const w = nextSpot.size[0] * progress + previousSpot.size[0] * regress;
							const h = nextSpot.size[1] * progress + previousSpot.size[1] * regress;

							const preWidth = platform.size[0];
							const preRelativeX = lander ? (lander.x - platform.x) : 0;
							platform.changeSize(w, h);

							if (lander) {
								const newRelativeX = preRelativeX / preWidth * w;
								const shiftX = newRelativeX - preRelativeX;
								lander.changePosition(lander.x + ddx + shiftX, lander.y + ddy, lander.z);
							}
						},
					});
				}
				const index = parseInt(option);
				this.movingPlatform.index = index;
				this.movingPlatform.path[index] = {
					x: 40 * col, y: 40 * row, size: [40, 40],
				};
				if (index === 0) {
					this.movingPlatform.changePosition(40 * col, 40 * row, this.movingPlatform.z);
				}
				return this.movingPlatform;
			}),
			'^': new GeneratorWithCallback((col, row, option) => {
				return this.spriteFactory.create({
					name: `lowceiling_${col}_${row}`,
					anim: this.atlas.debugCeiling,
					size: [40, 40],
					x: 40 * col, y: 40 * row,
				}, {
					canMerge: Constants.HORIZONTAL_MERGE,
					collide: 1, lowceiling: 1,
					init: (self, col, row, grid) => {
						if (!grid[row-1] || !grid[row-1][col] || !grid[row-1][col].block) {
							self.canLand = true;
							self.changeOpacity(.7);
						}
					},
				});				
			}),
			'?': new GeneratorWithCallback((col, row, option) => {
				return this.spriteFactory.create({
					name: `npc_${col}_${row}`,
					anim: this.atlas.npc.still,
					size: [40, 40],
					x: 40 * col, y: 40 * row,
				}, {
					collide: 1, npc: 1, noblock: 1,
					onChat: (self, sprite) => {
						if (!sprite.chatting) {
							self.startChat(self, sprite);
						} else {
							self.stopChat(self, sprite);
						}
					},
					startChat: (self, sprite) => {
						sprite.chatting = self.engine.lastTime;
						this.game.camera = "zoom";
						this.game.overlayHud.show(this.game.overlayHud);
					},
					stopChat: (self, sprite) => {
						sprite.chatting = 0;
						this.game.camera = "normal";
						this.game.overlayHud.hide(this.game.overlayHud);
					}
				});
			}),
			'$': new GeneratorWithCallback((col, row, option) => {
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
									this.game.audio.pickup.play();
								}
								coin.changeActive(false);
							}
						},
					},
				});
			}),
			'@': new GeneratorWithCallback((col, row, option) => {
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
							self.engine.refresher.delete(self);
						}
					},
				});
			}),
			'D': new GeneratorWithCallback((col, row, option) => {
				const door = this.spriteFactory.create({
					name: "the door",
					id: `door_${col}_${row}`,
					anim: this.atlas.debugDoorBack,
					size: [40, 60],
					x: 40 * col, y: 40 * row - 20,
				}, {
					collide: 1, noblock: 1,
					onOpen: self => {
						self.setProperty("opened", self.properties.opened ? 0 : self.engine.lastTime);
						this.game.camera = self.properties.opened ? "zoom" : "normal";
					},
					onChange: {
						opened: (self, opened) => {
							self.door.changeAnimation(opened ? this.atlas.debugDoorOpen : this.atlas.debugDoorStill);
						},
					},
				});
				door.door = this.spriteFactory.create({
					id: `door_door_${col}_${row}`,
					anim: this.atlas.debugDoorStill,
					size: [40, 60],
					x: 40 * col, y: 40 * row - 20,
				});
				return door;
			}),
		};
	}
}