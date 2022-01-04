class OverworldMapper extends SpriteMapper {
	constructor(game) {
		super(game);
		this.control = game.control;
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
			...this.map,
			'8': new GeneratorWithCallback((col, row, option) => {
				return this.spriteFactory.create({
					name: "hero",
					anim: this.atlas.hero.still,
					size: [50, 75, 2],
					hotspot: [25, 75],
					x: 40 * col, y: 400 - 10, z: -200 * row,
					rotation: [-90, 0, 0],					
					remember: true,
				});
			}),
			'[': new GeneratorWithCallback((col, row, option) => {
				return this.spriteFactory.create({
					name: `block_${col}_${row}`,
					anim: this.atlas.debugBlock,
					size: [40, 40],
					x: 40 * col, y: 400 - 10, z: 40 * row,
					rotation: [-90, 0, 0],					
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
					canMerge: "{horizontal_merge}",
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
					canMerge: "{horizontal_merge}",
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