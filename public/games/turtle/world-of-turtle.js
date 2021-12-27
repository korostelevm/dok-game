class WorldOfTurtle extends GameBase {
	async init(engine, gameName) {
		super.init(engine, gameName);

		const { gl, config } = engine;
		this.atlas = {
			backwall: await engine.addTexture({
				url: "assets/backwall.jpg",
			}),
			mazoo_still: await engine.addTexture({
				url: "assets/mazoo.png",
				cols: 3, rows: 4,
				range:[0],
			}),
			mazoo_down: await engine.addTexture({
				url: "assets/mazoo.png",
				cols: 3, rows: 4,
				frameRate: 10,
				range:[0, 3],
			}),
			mazoo_up: await engine.addTexture({
				url: "assets/mazoo.png",
				cols: 3, rows: 4,
				frameRate: 10,
				range:[4, 7],
			}),
			mazoo_right: await engine.addTexture({
				url: "assets/mazoo.png",
				cols: 3, rows: 4,
				frameRate: 10,
				range:[8, 11],
			}),
			mazoo_left: await engine.addTexture({
				url: "assets/mazoo.png",
				cols: 3, rows: 4,
				range:[8, 11],
				frameRate: 10,
				direction: -1,
			}),
			hex: await engine.addTexture({
				url: "assets/hex.png",
				collision_url: "assets/hex.png",
				cols: 2, rows: 2,
				range: [0],
			}),
			turtle: await engine.addTexture({
				url: "assets/turtle-spritesheet-rescaled.png",
				spriteWidth: 238, spriteHeight: 409,
				range:[6],
				frameRate: 10,
			}),
			turtle_run: await engine.addTexture({
				url: "assets/turtle-spritesheet-rescaled.png",
				spriteWidth: 238, spriteHeight: 409,
				range:[16, 23],
				frameRate: 24,
			}),
			turtle_run_up: await engine.addTexture({
				url: "assets/turtle-spritesheet-rescaled.png",
				spriteWidth: 238, spriteHeight: 409,
				range:[71, 79],
				frameRate: 24,
			}),
			turtle_run_down: await engine.addTexture({
				url: "assets/turtle-spritesheet-rescaled.png",
				spriteWidth: 238, spriteHeight: 409,
				range:[61, 70],
				frameRate: 24,
			}),
			peng: await engine.addTexture({
				url: "assets/peng-spritesheet-rescaled.png",
				spriteWidth: 349, spriteHeight: 409,
				range:[0],
			}),
			redsquare: await engine.addTexture({
				url: "assets/red-square.png",
			}),
		};
		const control = this.addPhysics(new Control8());

		const [viewportWidth, viewportHeight] = config.viewport.size;

		const backwallWidth = viewportWidth * 3, backwallHeight = viewportHeight * 3;
		this.backwall = this.spriteFactory.create({
			anim: this.atlas.backwall,
			size: [backwallWidth, backwallHeight],
			hotspot: [backwallWidth / 2, backwallHeight / 2],
			opacity: .5,
			x: viewportWidth / 2, y: viewportHeight + 10,
			z: -500,
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
				hotspot: [50, 150],
				x, y, z,
				isSprite: 1,
				slowdown: .5,
			}, {
				control: 1,
				onControl: (turtle, dx, dy) => {
					const speed = 200;
//					const accel = 200;
					turtle.changeMotion(dx * speed, 0, dy * speed);
//					turtle.changeAcceleration(dx * accel, 0, dy * accel);
					turtle.shadow.changeMotion(turtle.motion[0], turtle.motion[1], turtle.motion[2]);
//					turtle.shadow.changeAcceleration(turtle.acceleration[0], turtle.acceleration[1], turtle.acceleration[2]);
					turtle.collision.changeMotion(turtle.motion[0], turtle.motion[1], turtle.motion[2]);
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
				hotspot: [50, 150],
				x, y, z,
				light: 0,
				opacity: .5,
				rotation: [-90, 0, 0],					
			});
			this.turtle.collision = this.spriteFactory.create({
				anim: this.atlas.redsquare,
				size: [100, 100],
				hotspot: [50, 50],
				x, y, z,
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
				hotspot: [50, 110],
				x, y, z,
				isSprite: 1,
			});
			this.pengs.push(peng);			
			peng.shadow = this.spriteFactory.create({
				anim: this.atlas.peng,
				size: [100, 120],
				hotspot: [50, 110],
				x, y, z,
				light: 0,
				opacity: .5,
				rotation: [-90, 0, 0],					
			});
			peng.collision = this.spriteFactory.create({
				anim: this.atlas.redsquare,
				size: [100, 100],
				hotspot: [50, 50],
				x, y, z,
				rotation: [-90, 0, 0],					
			});
		}

		for (let row = 0; row < 11; row++) {
			for (let col = 0; col < 11; col++) {
				const x = row * 100 - 50;
				const y = 400;
				const z = (col - 5) * 100 - 450;
				this.spriteFactory.create({
					anim: this.atlas.hex,
					size: [100, 100],
					hotspot: [50, 50],
					x, y, z,
					rotation: [-90, 0, 0],					
				});
			}
		}

		this.cameras = {
		    "normal": {
		      "default": true,
		      "xOffset": 900,
		      "yOffset": 1000,
		      "zOffset": 1000,
		      "zoom": 1,
		      "follow": "turtle"
		    },			
		};
		this.camera = "normal";
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

	getInitialShift() {
		return {
			x: 0, y: 1000, z: 550,
			rotation: [60, 0, 0],
		};
	}

	applyCamera(camera) {
		const cameraConfig = this.cameras[camera];
		const followed = this[cameraConfig.follow];
		const zoom = cameraConfig.zoom;
		const shift = this.engine.shift;
		shift.goal.x = -followed.x * 2 / zoom + cameraConfig.xOffset;
		shift.goal.y = -followed.y * 2 / zoom + cameraConfig.yOffset;
		shift.goal.z = -followed.z * 2 / zoom + cameraConfig.zOffset;
		shift.goal.zoom = zoom;
		if (typeof(cameraConfig.minX) !== "undefined") {
			shift.goal.x = Math.max(cameraConfig.minX, shift.goal.x);
		}
		if (typeof(cameraConfig.minY) !== "undefined") {
			shift.goal.y = Math.max(cameraConfig.minY, shift.goal.y);			
		}
		if (typeof(cameraConfig.minZ) !== "undefined") {
			shift.goal.z = Math.max(cameraConfig.minZ, shift.goal.z);			
		}
		if (typeof(cameraConfig.maxX) !== "undefined") {
			shift.goal.x = Math.min(cameraConfig.maxX, shift.goal.x);
		}
		if (typeof(cameraConfig.maxY) !== "undefined") {
			shift.goal.y = Math.max(cameraConfig.maxY, shift.goal.y);			
		}
		if (typeof(cameraConfig.maxZ) !== "undefined") {
			shift.goal.z = Math.max(cameraConfig.maxZ, shift.goal.z);			
		}
	}

	refresh(time, dt) {
		super.refresh(time, dt);
//		this.applyCamera(this.camera);
	}
}