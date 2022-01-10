class FlatLand extends GameBase {
	async init(engine, gameName) {
		super.init(engine, gameName);

		const { gl, config } = engine;
		this.atlas = {
			backwall: await engine.addTexture({
				url: "assets/backwall.jpg",
				hotspot: Constants.HOTSPOT_CENTER,
			}),
			mazoo_still: await engine.addTexture({
				url: "assets/mazoo.png",
				cols: 3, rows: 4,
				range:[0],
				hotspot: Constants.HOTSPOT_BOTTOM,
			}),
			mazoo_down: await engine.addTexture({
				url: "assets/mazoo.png",
				cols: 3, rows: 4,
				frameRate: 10,
				range:[0, 3],
				hotspot: Constants.HOTSPOT_BOTTOM,
			}),
			mazoo_up: await engine.addTexture({
				url: "assets/mazoo.png",
				cols: 3, rows: 4,
				frameRate: 10,
				range:[4, 7],
				hotspot: Constants.HOTSPOT_BOTTOM,
			}),
			mazoo_right: await engine.addTexture({
				url: "assets/mazoo.png",
				cols: 3, rows: 4,
				frameRate: 10,
				range:[8, 11],
				hotspot: Constants.HOTSPOT_BOTTOM,
			}),
			mazoo_left: await engine.addTexture({
				url: "assets/mazoo.png",
				cols: 3, rows: 4,
				range:[8, 11],
				frameRate: 10,
				direction: -1,
				hotspot: Constants.HOTSPOT_BOTTOM,
			}),
			hex: await engine.addTexture({
				url: "assets/hex.png",
				collision_url: "assets/hex.png",
				cols: 2, rows: 2,
				range: [0],
				hotspot: Constants.HOTSPOT_CENTER,
			}),
		};

		const [viewportWidth, viewportHeight] = config.viewport.size;

		const backwallWidth = viewportWidth * 2, backwallHeight = viewportHeight * 2;
		this.backwall = this.spriteFactory.create({
			anim: this.atlas.backwall,
			size: [backwallWidth, backwallHeight],
			opacity: .5,
			x: viewportWidth / 2, y: viewportHeight / 2,
			z: -1000,
		});

		this.mazoos = [];
		for (let i = 0; i < 2000; i++) {
			const x = viewportWidth / 2 + (RandomUtils.random(i, 123) - .5) * viewportWidth * 4;
			const z = 1000 - RandomUtils.random(i, 888) * 2000;
			const y = 400;// + (z / 2000) * 500;
			this.mazoos.push(this.spriteFactory.create({
				anim: this.atlas.mazoo_still,
				size: [32, 32],
				x, y, z,
				spriteType: "sprite",
			}, {
				goal: [
					Math.random() * viewportWidth,
					y,
					-Math.random() * 2000,
				],
			}));
		}

		for (let i = 0; i < 1000; i++) {
			const x = viewportWidth / 2 + (RandomUtils.random(i,331) - .5) * viewportWidth * 4;
			const z = - RandomUtils.random(i,737) * 2000;
			const y = 400;// + (z / 2000) * 500 + 20;
			this.spriteFactory.create({
				anim: this.atlas.hex,
				size: [256, 256],
				x, y, z,
				rotation: [-90, 0, 0],					
			});
		}
		this.engine.keyboardHandler.addKeyDownListener('p', () => {
			this.engine.setPerspective(!this.engine.isPerspective);
		});

	}

	moveMazoos(time) {
		const gl = engine.gl;
		const config = engine.config;
		const viewportWidth = config.viewport.size[0];
		for (let i = 0; i < this.mazoos.length; i++) {
			const mazoo = this.mazoos[i];
			const goalX = mazoo.goal[0];
			const goalZ = mazoo.goal[2];
			const dx = (goalX - mazoo.x);
			const dz = (goalZ - mazoo.z);
			const dist = Math.max(1, Math.sqrt(dx*dx + dz*dz));
			if (!dist) {
				continue;
			}
			const z = mazoo.z + dz / dist;
			const y = 400;// + (z / 2000) * 500;
			mazoo.changePosition(mazoo.x + dx / dist, y, z, time);
			if (dist <= 1) {
				if (!mazoo.stillTime) {
					mazoo.stillTime = time;
					mazoo.changeAnimation(this.atlas.mazoo_still, time);
				} else if (time - mazoo.stillTime > 5000) {
					const x = viewportWidth / 2 + (Math.random() - .5) * viewportWidth * 4;
					mazoo.goal[0] = x;
					mazoo.goal[2] = -Math.random() * 2000;
				}
			} else {
				mazoo.stillTime = 0;
				if (Math.abs(dx) >= Math.abs(dz)) {
					mazoo.changeAnimation(dx < 0 ? this.atlas.mazoo_left : this.atlas.mazoo_right, time);
				} else {
					mazoo.changeAnimation(dz < 0 ? this.atlas.mazoo_up : this.atlas.mazoo_down, time);
				}
			}
		}
	}

	async isPerspective(engine) {
		return true;
	}

	getInitialShift() {
		return {
			x: 0, y: 0, z: 550,
			rotation: [0, 0, 0],
		};
	}

	refresh(time, dt) {
//		this.moveMazoos(time);
	}
}