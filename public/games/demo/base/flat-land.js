class FlatLand extends GameBase {
	async init(engine, gameCoreName) {
		await super.init(engine, gameCoreName);

		const { gl, config, viewportWidth, viewportHeight } = engine;

		this.mazoos = [];
		for (let i = 0; i < 2000; i++) {
			const x = viewportWidth / 2 + (RandomUtils.random(i, 123) - .5) * viewportWidth * 4;
			const z = 1000 - RandomUtils.random(i, 888) * 2000;
			const y = 400;
			this.mazoos.push(this.spriteFactory.create({
				anim: "mazoo_still",
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
				anim: "hex",
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
		const viewportWidth = engine.viewportWidth;
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

	refresh(time, dt) {
//		this.moveMazoos(time);
	}
}