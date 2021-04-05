class Lobby extends GameCore {
	async init(engine, gameName) {
		await super.init(engine, gameName);

		const { config } = engine;

		/* Load Audio */
		this.audio = {
			...this.audio,
		};

		this.atlas = {
			...this.atlas,
		};
	}

	async postInit() {
	}

	refresh(time, dt) {
		super.refresh(time, dt);
	}	
}