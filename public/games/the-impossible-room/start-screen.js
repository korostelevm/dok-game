class StartScreen extends GameBase {
	async init(engine, gameName) {
		await super.init(engine, gameName);

		const { config } = engine;

		/* Load Audio */
		this.audio = {
			...this.audio,
		};

		this.atlas = {
			...this.atlas,
			start_screen: await engine.addTexture({
				url: "assets/start-screen.png",
				opacity: 0,
			}),
			loading: await engine.addTexture({
				url: "assets/loading.png",
				opacity: 0,
			}),
		};

		const [viewportWidth, viewportHeight] = config.viewport.size;
		this.backwall = this.spriteFactory.create({
			anim: this.atlas.loading,
			size: [800, 400],
		});

		this.engine.preloadAssets((count, total) => {
			this.backwall.changeOpacity((count / total) * .5, this.engine.lastTime); 			
		}).then(totalCount => {
			this.backwall.changeAnimation(this.atlas.start_screen, this.engine.lastTime);
			this.backwall.changeOpacity(1, this.engine.lastTime); 
			this.engine.changeCursor(null);
		});
	}

	async postInit() {
	}

	handleMouse(e) {
		if (e.type === "click") {
			this.engine.setGame(new GameTitle());
		}
	}
}
StartScreen.start = true;