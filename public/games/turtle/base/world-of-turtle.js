class WorldOfTurtle extends GameBase {
	constructor(path) {
		super(path);
	}

	async init(engine, gameName) {
		await super.init(engine, gameName);

		const { gl, config } = engine;

		this.control = this.addPhysics(new Control8());
		this.collision = this.addPhysics(new Collision(true, true, true));


		const [viewportWidth, viewportHeight] = config.viewport.size;

		this.backwall = this.spriteFactory.create({
			anim: "backwall",
			size: [viewportWidth * 3, viewportHeight * 3],
			opacity: .5,
			x: viewportWidth / 2, y: viewportHeight + 10,
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
					close: -30, far: 30,
					show: true,
				},
			}, {
				control: 1,
				collide: 1,
				onControl: (self, dx, dy) => {
					this.updateControl(self, dx, dy);
				},
				onEnter: (self, sprite) => {
					console.log(sprite.id);
				},
				onCollide: (self, sprite, xPush, yPush, zPush) => {
					//	VERTICAL COLLIDE
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
					left: -40, right: 40,
					top: -80, bottom: 0,
					close: -40, far: 40,
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

	updateControl(turtle, dx, dy) {
		const speed = 200;
		const dist = Math.sqrt(dx * dx + dy * dy);
		const speedMul = dist ? speed / dist : 0;
		turtle.changeMotion(dx * speedMul, 0, dy * speedMul);
		if (dx !== 0) {
			turtle.changeDirection(dx);
			turtle.changeAnimation(this.atlas.turtle_run);
		} else if (dy < 0) {
			turtle.changeAnimation(this.atlas.turtle_run_up);
		} else if (dy > 0) {
			turtle.changeAnimation(this.atlas.turtle_run_down);
		} else {
			turtle.changeAnimation(this.atlas.turtle);						
		}
	}

	isPerpective() {
		return true;
	}
}