class Restroom extends GameCore {
	async init(engine) {
		await super.init(engine);

		const { gl, config } = engine;
		const { gender } = this.data;

		/* Load Audio */
		this.audio = {
			...this.audio,
		};

		/* Load image */
		this.atlas = {
			...this.atlas,
			backwall: await engine.addTexture(
				{
					url: "assets/toilet-room.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .25,
					texture_blend: "luminosity",
					cols:1,rows:4,
					range:[0],
				}),
		};

		const [viewportWidth, viewportHeight] = config.viewport.size;

		this.backwall = this.spriteFactory.create({
			anim: this.atlas.backwall,
			size: [800, 400],
		});
	}
}