class WorldOfTurtle extends GameBase {
	constructor(path) {
		super(path);
	}

	async init(engine, gameName) {
		await super.init(engine, gameName);

		const { gl, config } = engine;

		const control = this.addPhysics(new Control8());

		const [viewportWidth, viewportHeight] = config.viewport.size;

		this.backwall = this.spriteFactory.create({
			anim: this.atlas.backwall,
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
				collisionFrame: {
					left: -30, right: 30,
					top: 0, bottom: -60,
					close: -30, far: 30,
					show: true,
				},
			}, {
				control: 1,
				onControl: (turtle, dx, dy) => {
					const speed = 200;
					const dist = Math.sqrt(dx * dx + dy * dy);
					const speedMul = dist ? speed / dist : 0;
					turtle.changeMotion(dx * speedMul, 0, dy * speedMul);
					turtle.shadow.changeMotion(turtle.motion[0], turtle.motion[1], turtle.motion[2]);
					if (dx !== 0) {
						turtle.changeDirection(dx);
						turtle.shadow.changeDirection(turtle.direction);
						turtle.changeAnimation(this.atlas.turtle_run);
					} else if (dy < 0) {
						turtle.changeAnimation(this.atlas.turtle_run_up);
					} else if (dy > 0) {
						turtle.changeAnimation(this.atlas.turtle_run_down);
					} else {
						turtle.changeAnimation(this.atlas.turtle);						
					}
					turtle.shadow.changeAnimation(turtle.anim);
				},
			});
			this.turtle.shadow = this.spriteFactory.create({
				anim: this.atlas.turtle,
				size: [100, 170],
				x, y: y + 5, z,
				light: 0,
				opacity: .5,
				rotation: [-90, 0, 0],					
			});
		}

		this.pengs = [];
		for (let i = 0; i < 100; i++) {
			const x = viewportWidth / 2 + (RandomUtils.random(i, 123) - .5) * viewportWidth * 4;
			const z = - RandomUtils.random(i, 888) * 2000;
			const y = 400;
			const peng = this.spriteFactory.create({
				anim: this.atlas.peng,
				size: [100, 120],
				x, y, z,
				spriteType: "sprite",
				collisionFrame: {
					left: -40, right: 40,
					top: 0, bottom: -80,
					close: -40, far: 40,
					show: true,
				},
			});
			this.pengs.push(peng);			
			peng.shadow = this.spriteFactory.create({
				anim: this.atlas.peng,
				size: [100, 120],
				x, y: y + 5, z,
				light: 0,
				opacity: .5,
				rotation: [-90, 0, 0],					
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

		this.engine.keyboardHandler.addKeyDownListener('p', () => {
			this.engine.setPerspective(!this.engine.isPerspective);
		});
	}

	isPerpective() {
		return true;
	}

	getWindowSize(engine) {
		return [1000, 700];
	}

	async getViewportSize(engine) {
		return {
			pixelScale: 0,	//	autodetect
			viewportSize: [900, 600],
		}
	}

	refresh(time, dt) {
		super.refresh(time, dt);
	}
}