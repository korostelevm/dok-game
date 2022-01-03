class WorldOfTurtle extends GameBase {
	constructor(path) {
		super(path);
	}

	async init(engine, gameName) {
		await super.init(engine, gameName);

		const { gl, config } = engine;

		const [viewportWidth, viewportHeight] = config.viewport.size;

		this.backwall = this.spriteFactory.create({
			anim: "backwall",
			size: [viewportWidth * 3, viewportHeight * 3],
			opacity: .5,
			x: viewportWidth / 2,
			y: viewportHeight + 20,
			z: -450,
			rotation: [-90, 0, 0],
		});

		{
			const x = 450;
			const z = -400;
			const y = 400;

			this.turtle = this.spriteFactory.create({
				name: "turtle",
				anim: this.atlas.turtle,
				size: [100, 170],
				x, y, z: z + 10,
				spriteType: "sprite",
				shadow: 1,
				collisionFrame: {
					left: -30, right: 30,
					top: -60, bottom: 0,
					close: -50, far: 10,
					show: true,
				},
			}, {
				control: 1,
				collide: 1,
				lastJump: 0,
				manualRefresh: 1,
				dxMul: 1,
				dyMul: 1,
				onControl: (self, dx, dy) => {
					if (!self.airborne) {
						self.updateControl(self, dx, dy);
					}
				},
				onAction: (self, e) => {
					if (e.type === "keydown" && !self.airborne) {
						self.airborne = 1;
						self.lastJump = self.engine.lastTime;
						self.engine.refresher.add(self);
						self.updateControl(self, this.control.dx, this.control.dy, true);
					}
				},
				onEnter: (self, sprite) => {
					console.log(sprite.id);
				},
				onCollide: (self, sprite, xPush, yPush, zPush) => {
					//	VERTICAL COLLIDE
					self.recalculatePosition();
					if (Math.abs(zPush) < Math.abs(xPush)) {
						if (self.motion[2] * zPush < 0) {
							self.changeMotion(self.motion[0], self.motion[1], 0);
						}
						self.changePosition(self.x, self.y, self.z + zPush);
					} else {
						if (self.motion[0] * xPush < 0) {
							self.changeMotion(0, self.motion[1], self.motion[2]);
						}
						self.changePosition(self.x + xPush, self.y, self.z);
					}					
				},
				onStopCollision: (self, sprite) => {
					if (!self.airborne) {
						self.updateControl(self, this.control.dx, this.control.dy);
					}
				},
				onRefresh: (self, time, dt) => {
					const position = self.getRealPosition(time);
					const shadowOpacity = .5 * Math.max(0, 1 - (400 - position[1]) / 150);
					self.shadow.changeOpacity(shadowOpacity);
					if (position[1] >= 400) {
						self.airborne = 0;
						self.updateControl(self, this.control.dx, this.control.dy);
						self.engine.refresher.delete(self);
					}
				},
				updateControl: (self, dx, dy, jumping) => {
					const speed = 200;
					if (jumping) {
						if (self.dxMul < self.dyMul) {
							self.dxMul = 0;
						} else {
							self.dyMul = 0;
						}	
					}
					if (!dx && dy) {
						self.dxMul = 2.5;
						self.dyMul = 1;
					} else if (dx && !dy) {
						self.dxMul = 1;
						self.dyMul = 2.5;
					}
					dx *= self.dxMul;
					dy *= self.dyMul;

					const dist = Math.sqrt(dx * dx + dy * dy);
					const speedMul = dist ? speed / dist * (jumping ? 1.5 : 1) : 0;
					self.changeMotion(dx * speedMul, jumping ? -800 : 0, dy * speedMul);
					self.changeAcceleration(0, jumping ? 3000 : 0, 0);
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
			});
		}

		this.pengs = [];
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
					top: -80, bottom: 0,
					close: -40, far: 20,
					show: true,
				},
				shadow: 1,
			}, {
				collide: 1,				
			});
			this.pengs.push(peng);			
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

		this.engine.keyboardHandler.addKeyDownListener('p', () => {
			this.engine.setPerspective(!this.engine.isPerspective);
		});
	}

	isPerpective() {
		return true;
	}
}