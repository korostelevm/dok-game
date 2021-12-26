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
			peng: await engine.addTexture({
				url: "assets/peng-spritesheet-rescaled.png",
				spriteWidth: 349, spriteHeight: 409,
				range:[0],
			}),
		};

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

			this.spriteFactory.create({
				anim: this.atlas.turtle,
				size: [100, 170],
				hotspot: [50, 130],
				x, y, z,
				isSprite: 1,
			});
			this.spriteFactory.create({
				anim: this.atlas.turtle,
				size: [100, 170],
				hotspot: [50, 130],
				x, y, z,
				light: 0,
				opacity: .5,
				rotation: [-90, 0, 0],					
			});

			// this.spriteFactory.create({
			// 	anim: this.atlas.turtle,
			// 	size: [50, 50],
			// 	hotspot: [25, 25],
			// 	x, y, z:z-5,
			// 	isSprite: 1,
			// });
		}

		this.mazoos = [];
		for (let i = 0; i < 100; i++) {
			const x = viewportWidth / 2 + (RandomUtils.random(i, 123) - .5) * viewportWidth * 4;
			const z = - RandomUtils.random(i, 888) * 2000;
			const y = 400;
			this.mazoos.push(this.spriteFactory.create({
				anim: this.atlas.peng,
				size: [100, 120],
				hotspot: [50, 100],
				x, y, z,
				isSprite: 1,
			}));
		}

		for (let row = 0; row < 11; row++) {
			for (let col = 0; col < 11; col++) {
				const x = row * 100 - 50;
				const y = 400;
				const z = (col - 5) * 100 - 500;
				this.spriteFactory.create({
					anim: this.atlas.hex,
					size: [100, 100],
					hotspot: [50, 50],
					x, y, z,
					rotation: [-90, 0, 0],					
				});
			}
		}
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

	refresh(time, dt) {
	}
}