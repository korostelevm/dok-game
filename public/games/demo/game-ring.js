class GameRing extends GameBase {
	async init(engine, gameName) {
		super.init(engine, gameName);

		const { gl, config } = engine;
		this.atlas = {
			backwall: await engine.addTexture({
				url: "assets/backwall.jpg",
				hotspot: [0, 0],
			}),
			mazoo_still: await engine.addTexture({
				url: "assets/mazoo.png",
				cols: 3, rows: 4,
				range:[0],
				hotspot: HOTSPOT_BOTTOM,
			}),
			mazoo_down: await engine.addTexture({
				url: "assets/mazoo.png",
				cols: 3, rows: 4,
				frameRate: 10,
				range:[0, 3],
				hotspot: HOTSPOT_BOTTOM,
			}),
			mazoo_up: await engine.addTexture({
				url: "assets/mazoo.png",
				cols: 3, rows: 4,
				frameRate: 10,
				range:[4, 7],
				hotspot: HOTSPOT_BOTTOM,
			}),
			mazoo_right: await engine.addTexture({
				url: "assets/mazoo.png",
				cols: 3, rows: 4,
				frameRate: 10,
				range:[8, 11],
				hotspot: HOTSPOT_BOTTOM,
			}),
			mazoo_left: await engine.addTexture({
				url: "assets/mazoo.png",
				cols: 3, rows: 4,
				range:[8, 11],
				frameRate: 10,
				direction: -1,
				hotspot: HOTSPOT_BOTTOM,
			}),
		};

		const [viewportWidth, viewportHeight] = config.viewport.size;

		this.backwall = this.spriteFactory.create({
			anim: this.atlas.backwall,
			size: [viewportWidth, viewportHeight],
			opacity: .5,
			z: -1000,
		});

		this.mazoos = [];
		for (let i = 0; i < 1000; i++) {
			const x = Math.random() * viewportWidth;
			const y = Math.random() * viewportHeight;
			this.mazoos.push(this.spriteFactory.create({
				anim: this.atlas.mazoo_still,
				size: [16, 16],
				x, y, z: y / 400 * 100,
			}, {
				goal: [
					Math.random() * viewportWidth,
					Math.random() * viewportHeight,
				],
			}));
		}
	}

	moveMazoos(time) {
		const gl = engine.gl;
		const config = engine.config;
		const viewportWidth = config.viewport.size[0];
		const viewportHeight = config.viewport.size[1];
		for (let i = 0; i < this.mazoos.length; i++) {
			const mazoo = this.mazoos[i];
			const goalX = mazoo.goal[0];
			const goalY = mazoo.goal[1];
			const dx = (goalX - mazoo.x);
			const dy = (goalY - mazoo.y);
			const dist = Math.max(1, Math.sqrt(dx*dx + dy*dy));
			const x = mazoo.x + dx / dist;
			const y = mazoo.y + dy / dist;
			const z = y / 400 * 100;
			mazoo.changePosition(x, y, z, time);
			if (dist <= 1) {
				if (!mazoo.stillTime) {
					mazoo.stillTime = time;
					mazoo.changeAnimation(this.atlas.mazoo_still, time);
				} else if (time - mazoo.stillTime > 5000) {
					mazoo.goal[0] = Math.random() * viewportWidth;
					mazoo.goal[1] = Math.random() * viewportHeight;
				}
			} else {
				mazoo.stillTime = 0;
				if (Math.abs(dx) >= Math.abs(dy)) {
					mazoo.changeAnimation(dx < 0 ? this.atlas.mazoo_left : this.atlas.mazoo_right, time);
				} else {
					mazoo.changeAnimation(dy < 0 ? this.atlas.mazoo_up : this.atlas.mazoo_down, time);
				}
			}
		}
	}

	refresh(time, dt) {
		this.moveMazoos(time);
	}
}