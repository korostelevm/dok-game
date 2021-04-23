class Lobby extends GameCore {
	async init(engine, gameName) {
		await super.init(engine, gameName);

		const { gl, config } = engine;
		const { gender } = this.data;

		/* Load Audio */
		this.audio = {
			...this.audio,
		};

		this.atlas = {
			...this.atlas,
			backwall: await engine.addTexture(
				{
					url: "assets/lobby.png",
					collision_url: "assets/lobby-collision.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .15,
					texture_blend: "source-atop",
					cols:3,rows:8,
					range:[0],
				}),			
			backwallforeground: await engine.addTexture(
				{
					url: "assets/lobby.png",
					collision_url: "assets/lobby-collision.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .15,
					texture_blend: "source-atop",
					cols:3,rows:8,
					range:[23],
				}),			
			plants: await engine.addTexture(
				{
					url: "assets/lobby.png",
					texture_url: "assets/skin-texture.jpg",
					texture_alpha: .20,
					texture_blend: "source-atop",
					cols:3,rows:8,
					range:[22],
				}),			
			side_doors: await engine.addTexture(
				{
					url: "assets/lobby.png",
					collision_url: "assets/lobby-collision.png",
					cols:3,rows:8,
					range:[1],
				}),			
			lobby_dude: await engine.addTexture(
				{
					url: "assets/lobby.png",
					collision_url: "assets/lobby-collision.png",
					cols:3,rows:8,
					range:[17],
				}),
			lobby_dude_talking: await engine.addTexture(
				{
					url: "assets/lobby.png",
					collision_url: "assets/lobby-collision.png",
					cols:3,rows:8,
					range:[17, 18],
				}),
			lobby_front: await engine.addTexture({
					url: "assets/lobby.png",
					collision_url: "assets/lobby-collision.png",
					texture_url: "assets/skin-texture.jpg",
					texture_alpha: .05,
					texture_blend: "source-atop",
					cols:3,rows:8,
					range:[16],
				}),
			left_door: await engine.addTexture(
				{
					url: "assets/lobby.png",
					collision_url: "assets/lobby-collision.png",
					cols:3,rows:8,
					range:[14],
				}),
			left_door_opened: await engine.addTexture(
				{
					url: "assets/lobby.png",
					collision_url: "assets/lobby-collision.png",
					cols:3,rows:8,
					range:[15],
				}),			
		};

		this.backwall = this.spriteFactory.create({
			anim: this.atlas.backwall,
			size: [800, 400],
		});
		this.spriteFactory.create({
			anim: this.atlas.plants,
			size: [800, 400],
		});
		this.spriteFactory.create({
			anim: this.atlas.side_doors,
			size: [800, 400],
		});
		this.doorBack = this.spriteFactory.create({
			name: "Exit",
			anim: this.atlas.left_door_opened,
			size: [800, 400],
		}, {
			actions: [
				{ name: "exit",
					action: exit => {
						this.monkor.setProperty("paused", engine.lastTime);
						this.monkor.goal.x = -100;
					},
				},
			],
		});
		this.lobby_dude = this.spriteFactory.create({
			name: "Dick",
			anim: this.atlas.lobby_dude,
			size: [800, 400],
		}, {
			actions: [
				{ name: "look", message: "There's a man sitting behind the counter. He's not wearing any pants!",
					lookup: 500,
				},
				{ name: "talk", lookup: 500,
				},
			],
		});
		this.spriteFactory.create({
			anim: this.atlas.lobby_front,
			size: [800, 400],
		});

		const I = gender === "T" ? "We" : "I";

		this.sceneData.monkor = this.sceneData.monkor || { x: 120, y: 350 };
	}

	async postInit() {
		await super.postInit();
		this.spriteFactory.create({
			anim: this.atlas.backwallforeground,
			size: [800, 400],
		});
	}

	getWalkArea() {
		return this.backwall.getCollisionBox(engine.lastTime);		
	}

	refresh(time, dt) {
		super.refresh(time, dt);
	}	

	nextLevelLeft() {
		this.engine.setGame(new Restroom());
	}
}