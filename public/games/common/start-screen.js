class StartScreen extends GameBase {
	constructor(nextGame, configOverride) {
		super();
		this.classObj = nextGame?.classObj;
		this.gameConfig = nextGame?.gameConfig;
		this.configOverride = configOverride;
	}

	async init(engine, gameName) {
		await super.init(engine, gameName);

		const [ start_screen, loading ] = await Promise.all([
			"assets/start-screen.png",
			"assets/loading.png",
		].map(url => engine.addTexture({ url, opacity: 0 })));

		this.atlas = {
			...this.atlas,
			start_screen,
			loading,
		};

		const {viewportWidth, viewportHeight} = engine;

		const anim = this.atlas.loading;
		const { spriteWidth, spriteHeight } = this.atlas.loading;
		this.backwall = this.spriteFactory.create({
			anim,
			size: [spriteWidth, spriteHeight],
			x: (viewportWidth - spriteWidth) / 2, y: (viewportHeight - spriteHeight) / 2,
		});

		this.engine.preloadAssets((count, total) => {
			this.backwall.changeOpacity((count / total) * .5, this.engine.lastTime); 			
		}).then(totalCount => {
			this.backwall.changeAnimation(this.atlas.start_screen, this.engine.lastTime);
			this.backwall.changeOpacity(1, this.engine.lastTime); 
			this.engine.cursorManager.changeCursor(null);
		});
	}

	async getSettings(engine) {
		const { gameConfig } = this;
		const json = await engine.fileUtils.load(gameConfig);
		return json?.settings || super.getSettings(engine);
	}

	async postInit() {
	}

	handleMouse(self, e) {
		if (e.type === "click") {
			const { classObj, gameConfig } = this;
			if (classObj) {
				this.engine.setGame(new classObj(gameConfig, this.configOverride));
			} else {
				throw new Error("Invalid start screen. Next scene missing.");
			}
		}
	}
}
