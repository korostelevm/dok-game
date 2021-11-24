class GameTitle extends GameBase {
	async init(engine, gameName) {
		await super.init(engine, gameName);

		const { config } = engine;

		/* Load Audio */
		this.audio = {
			...this.audio,
			om: new Sound("audio/om.mp3", 1),
		};

		this.atlas = {
			...this.atlas,
			backwall: await engine.addTexture({
				url: "assets/backwall.jpg",
			}),
			title: await engine.addTexture({
				url: "assets/title.png",
				texture_url: "assets/backwall.jpg",
				texture_opacity: .2,
			}),
		};

		const [viewportWidth, viewportHeight] = config.viewport.size;
		this.backwall = this.spriteFactory.create({
			anim: this.atlas.backwall,
			size: [800, 400],
			opacity: .2,
		});
		this.title = this.spriteFactory.create({
			anim: this.atlas.title,
			x: viewportWidth / 2 - 350,
			y: viewportHeight / 2 - 40,
			size: [700, 80],
			opacity: .7,
		});

		await this.engine.changeCursor("wait");
	}

	async postInit() {
		this.audio.om.play();
	}

	refresh(time, dt) {
		super.refresh(time, dt);
		if (!this.fadeStart) {
			this.fadeStart = time;
		}
		const { config } = this.engine;
		const timeDiff = (time - this.fadeStart);
		const log = Math.log(timeDiff) / 10;

		const totalTime = 10000;
		const [viewportWidth, viewportHeight] = config.viewport.size;
		const width = 700 * log;
		const height = 80 * log;
		const opacityOut = Math.max(0, (totalTime - timeDiff) / 2000);
		const opacity = Math.min(opacityOut, Math.min(1, timeDiff / 5000));
		const x = viewportWidth / 2 - width / 2;
		const y = viewportHeight / 2 - height / 2;
		this.title.changePosition(x, y, time);
		this.title.changeSize(width, height, time);
		this.title.changeOpacity(opacity, time);
		if (timeDiff > totalTime && !this.changingScene) {
			this.changingScene = true;
			this.engine.setGame(new Menu());
		}
	}
}
