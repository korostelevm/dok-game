class WorldOfTurtle extends GameBase {
	async init(engine, coreName) {
		await super.init(engine, coreName);

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
				aux: {
					"HighlightAuxiliary": {}
				},
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
				onRefresh: (time) => {
					const self = this.turtle;
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
				onRelease: (self) => {
					self.airborne = 1;
				},
			});


			const socialBox = this.spriteFactory.create({
				x, y: 400, z,
				spriteType: "sprite",
				collisionFrame: {
					left: -60, right: 60,
					top: -60, bottom: 0,
					close: -70, far: 50,
				},
				showCollisionBox: this.engine.debug ? .2 : 0,
			}, {
				collide: 1,	noblock: 1,			
			});
			socialBox.follow(this.turtle);
		}

		this.engine.keyboardHandler.addKeyDownListener('p', () => {
			this.engine.setPerspective(!this.engine.isPerspective);
		});
	}
}