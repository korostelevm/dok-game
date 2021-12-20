class FlatLand extends GameBase {
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
		};

		const [viewportWidth, viewportHeight] = config.viewport.size;

		this.backwall = this.spriteFactory.create({
			anim: this.atlas.backwall,
			size: [viewportWidth, viewportHeight],
			hotspot: [viewportWidth / 2, viewportHeight / 2],
			opacity: .5,
			x: viewportWidth / 2, y: viewportHeight / 2,
			z: -1000,
		});

		this.mazoos = [];
		for (let i = 0; i < 1000; i++) {
			const x = Math.random() * viewportWidth;
			const z = - Math.random() * 1000
			console.log(z);
			this.mazoos.push(this.spriteFactory.create({
				anim: this.atlas.mazoo_still,
				size: [32, 32],
				hotspot: [16, 32],
				x, y: 400, z,
			}, {
				goal: [
					Math.random() * viewportWidth,
					0,
					-Math.random() * 1000,
				],
			}));
		}
	}

	isPerpective() {
		return true;
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
			mazoo.changePosition3d(mazoo.x + dx / dist, mazoo.y, mazoo.z + dz / dist, time);
			if (dist <= 1) {
				if (!mazoo.stillTime) {
					mazoo.stillTime = time;
					mazoo.changeAnimation(this.atlas.mazoo_still, time);
				} else if (time - mazoo.stillTime > 5000) {
					mazoo.goal[0] = Math.random() * viewportWidth;
					mazoo.goal[2] = -Math.random() * 1000;
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

	refresh(time, dt) {
		this.moveMazoos(time);
	}
}