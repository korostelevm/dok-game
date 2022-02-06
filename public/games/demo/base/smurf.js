class Smurf extends GameBase {
	async init(engine, gameCoreName) {
		await super.init(engine, gameCoreName);

		const { gl, config, viewportWidth, viewportHeight } = engine;

		for (let i = 0; i < 2000; i++) {
			const x = viewportWidth / 2 + (Math.random() - .5) * viewportWidth * 10;
			const z = - Math.random() * 2000;
			const y = 400;// + (z / 2000) * 500;
			const smurf = this.spriteFactory.create({
				anim: this.atlas.smurf_walk,
				size: [32, 32],
				x, y, z,
				motion: [100, 0, 0],
				spriteType: "sprite",
				animationTime: Math.random() * 1000000,
				list: "mazoos",
			}, {
				goal: [
					Math.random() * viewportWidth,
					y,
					-Math.random() * 2000,
				],
			});
		}

		for (let i = 0; i < 1000; i++) {
			const x = viewportWidth / 2 + (Math.random() - .5) * viewportWidth * 4;
			const z = - Math.random() * 4000;
			const y = 400;// + (z / 2000) * 500 + 20;
			this.spriteFactory.create({
				anim: this.atlas.hex,
				size: [256, 256],
				x, y, z,
				rotation: [-90, 0, 0],					
			});
		}

		this.redLine = this.spriteFactory.create({
			anim: this.atlas.red_line,
			size: [2400, 32],
			rotation: [-90, 0, 0],					
			x: -800, y: 400,
			opacity: .5,
		});
		this.redLineX = this.spriteFactory.create({
			anim: this.atlas.red_line,
			size: [50, 1600],
			rotation: [-90, 0, 0],					
			x: 400, y: 400, z: -1000,
			opacity: .5,
		});

		this.mushrooms = [

		];
	}

	handleMouse(e, x, y) {
		const zdiff = (y - 400) * 3 - 100;
		const xdiff = 400 + (x-400) * (1 - zdiff / 500);
		if (e.type === "mousemove") {
			const inGame = x >= 0 && x < 800 && y >= 60 && y < 400;
			if (inGame) {
				this.redLine.changePosition(this.redLine.x, this.redLine.y, zdiff);
				this.redLineX.changePosition(xdiff, this.redLineX.y, this.redLineX.z);
			}
			this.redLine.changeOpacity(inGame ? 1 : 0);
			this.redLineX.changeOpacity(inGame ? 1 : 0);
			this.engine.cursorManager.changeCursor(inGame && y > 80 ? "none" : this.arrowCursor);

			let selectedMushroom = null;
			for (let i = 0; i < this.mushrooms.length; i++) {
				const mushroom = this.mushrooms[i];
				const dx = mushroom.x - xdiff;
				const dz = mushroom.z - zdiff;
				const dist = Math.sqrt(dx * dx + dz * dz);
				if (dist < 100) {
					selectedMushroom = mushroom;
				}
			}
			if (this.selectedMushroom !== selectedMushroom) {
				if (this.selectedMushroom) {
					this.selectedMushroom.changeLight(1);
					if (this.selectedMushroom.grown) {
						this.engine.refresher.delete(this.selectedMushroom);
					}
				}

				this.redLine.changeAnimation(selectedMushroom ? this.atlas.blue_line : this.atlas.red_line);
				this.redLineX.changeAnimation(selectedMushroom ? this.atlas.blue_line : this.atlas.red_line);
				this.selectedMushroom = selectedMushroom;
				if (this.selectedMushroom) {
					this.engine.refresher.add(this.selectedMushroom);				
				}
			}
		}
		if (e.type === "mousedown") {
			const mushroom = this.spriteFactory.create({
				anim: this.atlas.mushroom,
				size: [32,32],
				x: xdiff, y:400, z:zdiff,
				opacity: .5,
				spriteType: "sprite",
			}, {
				onRefresh: () => {
					if (!mushroom.built) {
						const constructionTime = 10000;
						const age = mushroom.engine.lastTime - mushroom.created;
						const progress = (this.engine.lastTime - mushroom.created) / constructionTime;
						const growTime = 200;
						const baseSize = 32 + (128-32) * Math.min(1, Math.max(0, (age - (constructionTime - growTime)) / growTime));
						const width = progress >= 1 ? baseSize : baseSize + 5 * Math.sin(age / 100),
							height = progress >= 1 ? baseSize : baseSize + 5 * Math.cos(age / 100);
						mushroom.changeSize(width, height);
						mushroom.meter.changeSize(progress * 64, 8);
						if (progress >= 1) {
							mushroom.changeOpacity(1);
							mushroom.meter.changeActive(false);
							if (mushroom !== this.selectedMushroom) {
								mushroom.engine.refresher.delete(mushroom);
							}
							mushroom.built = 1;
						}
					}
					mushroom.changeLight(this.selectedMushroom !== mushroom ? 1 : (1 + Math.sin(mushroom.engine.lastTime / 30)));
				},
			});
			mushroom.created = this.engine.lastTime;
			mushroom.meter = this.spriteFactory.create({
				anim: this.atlas.meter,
				size: [64,8],
				x: xdiff - 32, y:400, z:zdiff + 10,				
			});
			
			this.mushrooms.push(mushroom);
		}
	}
}