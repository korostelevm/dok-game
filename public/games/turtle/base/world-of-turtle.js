class WorldOfTurtle extends GameBase {
	constructor(path) {
		super(path);
	}

	async init(engine, gameName) {
		await super.init(engine, gameName);

		const { gl, config } = engine;

		{
			const x = 450;
			const z = -400;
			const y = 400;

			this.turtle = this.spriteFactory.create({
				name: "turtle",
				anim: "turtle",
				size: [100, 170],
				x, y, z: z + 10,
				spriteType: "sprite",
				shadow: 1,
				collisionFrame: {
					left: -30, right: 30,
					top: -50, bottom: 0,
					close: -50, far: 10,
				},
				showCollisionBox: this.engine.debug,
			}, {
				gravity: 1,
				control: 1,
				collide: 1,
				lastJump: 0,
				manualRefresh: 1,
				airborne: 0,
				landed: 1,
				dxMul: 1,
				dyMul: 1,
				onControl: (self, dx, dy) => {
					if (!self.airborne) {
						self.updateControl(self, dx, dy);
					}
				},
				onAction: (self, e) => {
					if (e.type === "keydown" && !self.airborne) {
						const time = self.engine.lastTime;
						self.lastJump = time;
						self.airborne = time;
						self.landed = 0;
						self.engine.refresher.add(self);
						self.updateControl(self, this.control.dx, this.control.dy, true);
					}
				},
				onEnter: (self, sprite) => {
					console.log(sprite.id);
				},
				onCollide: (self, sprite, xPush, yPush, zPush) => {
					if (sprite.noblock) {
						return;
					}
					//	VERTICAL COLLIDE
					self.recalculatePosition();
					if (Math.abs(yPush) < Math.abs(zPush) && Math.abs(yPush) < Math.abs(xPush)) {
						if (yPush < 0) {
							self.changePosition(self.x, self.y + yPush * 2, self.z);
							self.changeMotion(self.motion[0], self.motion[1], self.motion[2]);
						}
					} else if (Math.abs(zPush) < Math.abs(xPush)) {
						if (self.motion[2] * zPush < 0) {
							self.changeMotion(-self.motion[0]/2, self.motion[1], -self.motion[2]/2 + zPush);
						}
						self.changePosition(self.x, self.y, self.z + zPush * 2);
					} else {
						if (self.motion[0] * xPush < 0) {
							self.changeMotion(-self.motion[0]/2 + xPush, self.motion[1], -self.motion[2]/2);
						}
						self.changePosition(self.x + xPush * 2, self.y, self.z);
					}					
				},
				onLeave: (self, sprite) => {
					if (!self.airborne) {
						self.updateControl(self, this.control.dx, this.control.dy);
					}
				},
				onRefresh: (self, time, dt) => {
					const position = self.getRealPosition(time);
					position[1] = Math.min(400, position[1]);
					const shadowOpacity = .5 * Math.max(0, 1 - (400 - position[1]) / 150);
					self.shadow.changeOpacity(shadowOpacity);
				},
				updateControl: (self, dx, dy, jumping) => {
					const speed = 200;

					if (!dx && dy) {
						self.dxMul = 1.5;
						self.dyMul = 1;
					} else if (dx && !dy) {
						self.dxMul = 1;
						self.dyMul = 1.5;
					}

					dx *= self.dxMul;
					dy *= self.dyMul;

					const dist = Math.sqrt(dx * dx + dy * dy);
					const speedMul = dist ? speed / dist * (jumping ? 1.5 : 1) : 0;
					self.changeMotion(dx * speedMul, jumping ? -700 : 0, dy * speedMul);
					if (dx !== 0) {
						self.changeDirection(dx);
					}

					if (Math.abs(dx) > Math.abs(dy)) {
						self.changeAnimation(jumping ? this.atlas.turtle_jump : this.atlas.turtle_run);
					} else if (dy < 0) {
						self.changeAnimation(jumping ? this.atlas.turtle_jump_up : this.atlas.turtle_run_up);
					} else if (dy > 0) {
						self.changeAnimation(jumping ? this.atlas.turtle_jump_down : this.atlas.turtle_run_down);
					} else {
						self.changeAnimation(jumping ? this.atlas.turtle_jump : this.atlas.turtle);						
					}
				},
				canJump: (self) => {
					return !self.airborne;
				},
				onLand: (self, time, yLand) => {
					self.airborne = 0;
					self.landed = time;
					self.changeAcceleration(0, 0, 0);
					self.updateControl(self, self.game.control.dx, self.game.control.dy);
					self.changeMotion(self.motion[0], 0, self.motion[2], time);
					self.changePosition(self.x, yLand, self.z, time);
					self.engine.refresher.delete(self);
				},
			});
		}

		const [viewportWidth, viewportHeight] = config.viewport.size;

		for (let i = 0; i < 100; i++) {
			const x = viewportWidth / 2 + (RandomUtils.random(i, 123) - .5) * viewportWidth * 4;
			const z = - RandomUtils.random(i, 888) * 2000;
			const y = 400;
			const peng = this.spriteFactory.create({
				name: peng => `peng-${i}`,
				anim: this.atlas.peng,
				size: [100, 120],
				x, y, z,
				spriteType: "sprite",
				collisionFrame: {
					left: -30, right: 30,
					top: -60, bottom: 0,
					close: -40, far: 20,
				},
				showCollisionBox: this.engine.debug,
				shadow: 1,
			}, {
				collide: 1,				
			});
		}

		for (let row = 0; row < 11; row++) {
			for (let col = 0; col < 11; col++) {
				const x = row * 100 - 50;
				const y = 400;
				const z = (col - 5) * 100 - 400;
				this.spriteFactory.create({
					anim: this.atlas.hex,
					size: [100, 100],
					x, y, z,
					rotation: [-90, 0, 0],					
				});
			}
		}

		this.selectionBox = this.spriteFactory.create({
			anim: this.atlas.selectionBox,
			size: [50, 50],
			x: 400, y: 400, z: 400,
			rotation: [-90, 0, 0],
			collisionFrame: {
				left: -25, right: 25,
				top: -5, bottom: 0,
				close: -25, far: 25,
			},
		}, {
			collide: 1, noblock: 1,
			changeSelection: (self, sprite) => {
				if (self.selection) {
					self.selection.changeLight(1);
				}
				self.release(self);
				self.selection = sprite;
			},
			onEnter: (self, sprite) => {
				if (!self.holding) {
					self.changeSelection(self, sprite);
				}
			},
			onLeave: (self, sprite) => {
				if (sprite === self.selection && !self.holding) {
					self.release(self);
					self.changeSelection(self, null);
				}
			},
			onRefresh: (self, time, dt) => {
				if (self.selection) {
					if (self.active) {
						self.selection.changeLight(1 + Math.random());
						if (self.holding) {
							self.selection.changePosition(self.x, self.selection.y, self.z);
						}
					} else {
						self.changeSelection(self, null);
					}
				}
			},
			hold: (self) => {
				if (self.selection) {
					self.selection.changePosition(self.selection.x, 380, self.selection.z);
					self.holding = true;
					self.lastSelection = self.selection;
				} else {
					self.lastSelection = null;
				}
			},
			release: (self) => {
				if (self.selection) {
					self.selection.changePosition(self.selection.x, 400, self.selection.z);
					self.holding = false;
				}
			},
		});

		this.engine.keyboardHandler.addKeyDownListener('p', () => {
			this.engine.setPerspective(!this.engine.isPerspective);
		});
	}

	handleMouse(e) {
		const x = e.pageX - this.engine.canvas.offsetLeft, y = e.pageY - this.engine.canvas.offsetTop;
		const inGame = e.type !== "mouseleave" && x >= 0 && x < this.engine.viewportWidth && y >= 0 && y < this.engine.viewportHeight;
		const onHud = e.type !== "mouseleave" && this.overlayHud.visible && inGame && y >= this.engine.viewportHeight - 150;
		this.mouseX = x;
		this.mouseY = y;
		this.engine.changeCursor(e.type !== "mouseleave" && inGame && !onHud ? "none" : this.arrowCursor);
		this.selectionBox.changeActive(inGame && !onHud);

		if (e.type === "mousedown") {
			this.selectionBox.hold(this.selectionBox);
			this.overlayHud.visible = this.selectionBox.lastSelection;
		} else if (e.type === "mouseup" || e.type === "mouseleave") {
			this.selectionBox.release(this.selectionBox);
		}
	}

	refresh(time, dt) {
		super.refresh(time, dt);
		this.selectionBox.changePosition(this.mouseX - this.engine.shift.x / 2 - 50, this.selectionBox.y, this.mouseY + this.engine.shift.z / 2 - 330);
	}
}