class Smurf extends GameBase {
	async init(engine, gameName) {
		super.init(engine, gameName);

		const { gl, config } = engine;
		this.atlas = {
			backwall: await engine.addTexture({
				url: "assets/backwall.jpg",
				hotspot: Constants.HOTSPOT_CENTER,
			}),
			smurf_still: await engine.addTexture({
				url: "assets/smurf.png",
				spriteWidth: 256, spriteHeight: 256,
				range:[1],
				hotspot: Constants.HOTSPOT_BOTTOM,
			}),
			smurf_walk: await engine.addTexture({
				url: "assets/smurf.png",
				spriteWidth: 256, spriteHeight: 256,
				range:[0, 1],
				frameRate: 5,
				hotspot: Constants.HOTSPOT_BOTTOM,
			}),
			hex: await engine.addTexture({
				url: "assets/hex.png",
				collision_url: "assets/hex.png",
				cols: 2, rows: 2,
				range: [0],
				hotspot: Constants.HOTSPOT_CENTER,
			}),
			red_line: await engine.addTexture({
				url: "assets/red-line.png",
				spriteWidth: 100, spriteHeight: 4,
				range:[0],
				hotspot: [0, .5],
			}),
			blue_line: await engine.addTexture({
				url: "assets/red-line.png",
				spriteWidth: 100, spriteHeight: 4,
				range:[1],
				hotspot: [0, .5],
			}),
			mushroom: await engine.addTexture({
				url: "assets/mushrooms.png",
				spriteWidth: 512, spriteHeight: 512,
				range:[0],
				hotspot: Constants.HOTSPOT_BOTTOM,
			}),
			big_mushroom: await engine.addTexture({
				url: "assets/mushrooms.png",
				spriteWidth: 512, spriteHeight: 512,
				range:[1],
				hotspot: Constants.HOTSPOT_BOTTOM,
			}),
			flower_mushroom: await engine.addTexture({
				url: "assets/mushrooms.png",
				spriteWidth: 512, spriteHeight: 512,
				range:[2],
				hotspot: Constants.HOTSPOT_BOTTOM,
			}),
			mushroom_lab: await engine.addTexture({
				url: "assets/mushrooms.png",
				spriteWidth: 512, spriteHeight: 512,
				range:[3],
				hotspot: Constants.HOTSPOT_BOTTOM,
			}),
			mushroom_workshop: await engine.addTexture({
				url: "assets/mushrooms.png",
				spriteWidth: 512, spriteHeight: 512,
				range:[4],
				hotspot: Constants.HOTSPOT_BOTTOM,
			}),
			meter: await engine.addTexture({
				url: "assets/meter.png",
				spriteWidth: 64, spriteHeight: 8,
				range:[0],
				hotspot: [0,0],
			}),
			meter_back: await engine.addTexture({
				url: "assets/meter.png",
				spriteWidth: 64, spriteHeight: 8,
				range:[1],
				hotspot: [0,0],
			}),
		};

		const [viewportWidth, viewportHeight] = config.viewport.size;

		const backwallWidth = viewportWidth * 5, backwallHeight = viewportHeight * 5;
		this.backwall = this.spriteFactory.create({
			anim: this.atlas.backwall,
			size: [backwallWidth, backwallHeight],
			opacity: .5,
			x: viewportWidth, y: viewportHeight * 2,
			z: -1000,
		});

		this.mazoos = [];
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
			}, {
				goal: [
					Math.random() * viewportWidth,
					y,
					-Math.random() * 2000,
				],
			});
			smurf.changeAnimationTime(Math.random() * 1000000);
			this.mazoos.push(smurf);
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
		this.engine.setClamp(-3000, 3000, 0, 0, 0, 0);
	}

	handleMouse(e) {
		const x = e.pageX - this.engine.canvas.offsetLeft, y = e.pageY - this.engine.canvas.offsetTop;
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
			this.engine.changeCursor(inGame && y > 80 ? "none" : this.arrowCursor);

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
				onRefresh: mushroom => {
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

	async isPerspective(engine) {
		return true;
	}

	getInitialShift() {
		return {
			x: 0, y: 1000, z: -450,
			rotation: [45, 0, 0],
		};
	}
}