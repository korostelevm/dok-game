class Entrance extends GameCore {
	constructor(imageLoader, data) {
		super(imageLoader, data);
		imageLoader.preloadImages(
			"assets/background-door.png",
			"assets/background-door-collision.png",
			"assets/sign.png",
			"assets/smoking-sign.png",
			"assets/piano.png",
			"assets/mouse.png",
			"assets/mat.png",
			"assets/mat-collision.png",
			"assets/monkor.png",
			"assets/monkor-collision.png",
			"assets/skin-texture.jpg",
			"assets/backwall.jpg",
		);
	}

	async init(engine) {
		await super.init(engine);

		const { gl, config } = engine;
		const { gender } = this.data;

		engine.chrono.tick("game init start.");

		/* Load image */
		this.atlas = {
			...this.atlas,
			entrance: await engine.addTexture(
				{
					url: "assets/background-door.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .25,
					texture_blend: "luminosity",
					cols:2,rows:4,
					collision_url: "assets/background-door-collision.png",
					range:[0],
				}),
			entrance_open: await engine.addTexture(
				{
					url: "assets/background-door.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .25,
					texture_blend: "luminosity",
					cols:2,rows:4,
					collision_url: "assets/background-door-collision.png",
					frameRate: 10,
					range:[4,6],
				}),
			entrance_opened: await engine.addTexture(
				{
					url: "assets/background-door.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .25,
					texture_blend: "luminosity",
					cols:2,rows:4,
					collision_url: "assets/background-door-collision.png",
					range:[6],
				}),
			sign: await engine.addTexture(
				{
					url: "assets/sign.png",
					collision_url: "assets/sign.png",
				}),
			smokingsign: await engine.addTexture(
				{
					url: "assets/smoking-sign.png",
					collision_url: "assets/smoking-sign.png",
				}),
			cigarette: await engine.addTexture(
				{
					url: "assets/cigarette.png",
					collision_url: "assets/cigarette.png",
				}),
			mat: await engine.addTexture(
				{
					url: "assets/mat.png",
					texture_url: "assets/skin-texture.jpg",
					texture_alpha: .3,
					cols:2,rows:4,
					collision_url: "assets/mat-collision.png",
					range:[0],
				}),
			mat_pulling: await engine.addTexture(
				{
					url: "assets/mat.png",
					texture_url: "assets/skin-texture.jpg",
					texture_alpha: .3,
					cols:2,rows:4,
					collision_url: "assets/mat-collision.png",
					frameRate: 4,
					range:[1, 2],
				}),
			mat_pulled: await engine.addTexture(
				{
					url: "assets/mat.png",
					texture_url: "assets/skin-texture.jpg",
					texture_alpha: .3,
					cols:2,rows:4,
					collision_url: "assets/mat-collision.png",
					range:[2],
				}),
			mat_picked_key: await engine.addTexture(
				{
					url: "assets/mat.png",
					texture_url: "assets/skin-texture.jpg",
					texture_alpha: .3,
					cols:2,rows:4,
					collision_url: "assets/mat-collision.png",
					range:[3],
				}),
		};
//		this.imageLoader.unload();
		engine.chrono.tick("done creating atlas");

		const [viewportWidth, viewportHeight] = config.viewport.size;

		this.inventoryDetails = {
			...this.inventoryDetails,
			"game title": {
				actions: [
					{ name: "read", message: () => `${document.getElementById("title").innerText}` },
				],
			},
		};

		for (let name in this.inventoryDetails) {
			this.inventoryDetails[name].name = name;
		}

		engine.chrono.tick("done setting up inventory");

		const I = gender === "T" ? "We" : "I";

		this.entrance = engine.spriteCollection.create({
			name: "entrance door",
			anim: this.atlas.entrance,
			size: [800, 400],
		}, {
			defaultCommand: (item, target) => target.unlocked ? `use ${item.name} on ${target.name}` : `unlock ${target.name} with ${item.name}`,
			actions: [
				{ name: "look", condition: entrance => !entrance.opened,
					message: () => `There's a door, that leads to ${this.title.innerText}` },
				{ name: "open", condition: entrance => !entrance.unlocked, message: `It's locked.` },
				{ name: "unlock", condition: entrance => this.selectedItem === "key" && !entrance.unlocked,
					message: `Yeah! ${I} unlocked the door.`,
					item: "key",
					command: (item, target) => `unlock ${target.name} with ${item.name}.`,
					action: entrance => {
						engine.playAudio("audio/dud.mp3", 1);
						entrance.unlocked = true;
						entrance.unlockedOnce = true;
						setTimeout(() => {
							this.showBubble(entrance.pendingMessage);
							entrance.pendingMessage = null;
						}, 500);
					},
				},
				{ name: "lock", condition: entrance => this.selectedItem === "key" && entrance.unlocked,
					message: ` ${I} locked the door.`,
					item: "key",
					command: (item, target) => `lock ${target.name} with ${item.name}.`,
					action: entrance => {
						engine.playAudio("audio/dud.mp3", 1);
						entrance.unlocked = false;
						entrance.opened = false;
						entrance.changeAnimation(this.atlas.entrance, engine.lastTime);
						setTimeout(() => {
							this.showBubble(entrance.pendingMessage);
							entrance.pendingMessage = null;
						}, 500);
					},
				},
				{ name: "close", condition: entrance => entrance.unlocked && entrance.opened,
					action: entrance => {
						engine.playAudio("audio/hit.mp3", .5);
						entrance.opened = false;
						entrance.changeAnimation(this.atlas.entrance, engine.lastTime);
					},
				},
				{ name: "open", condition: entrance => entrance.unlocked && !entrance.opened,
					action: entrance => {
						engine.playAudio("audio/door.mp3", .3);
						entrance.changeAnimation(this.atlas.entrance_open, engine.lastTime);
					},
				},
				{ name: "enter", condition: entrance => entrance.opened && this.title.innerText.toLowerCase().contains("impossible"), message: () => ` ${I} don't want to go in, it's ${this.title.innerText}! ${I} might never escape!` },
				{ name: "enter", condition: entrance => entrance.opened && !this.title.innerText.toLowerCase().contains("impossible"), message: () => `I guess this is not the impossible room. This is ${this.title.innerText}. Okay, ${I} shall go in.`,
					action: entrance => {
						this.monkor.paused = engine.lastTime;
						this.showBubble(entrance.pendingMessage, () => {
							setTimeout(() => {
								this.showBubble(null);
								this.monkor.goingup = engine.lastTime;
							}, 1000);
						});
						entrance.pendingMessage = null;
					},
				},
			],
			onFrame: {
				6: entrance => {
					if (!entrance.opened) {
						entrance.changeAnimation(this.atlas.entrance_opened, engine.lastTime);
						entrance.opened = true;
					}
				},
			},
		});

		engine.spriteCollection.create({
			name: "sign",
			anim: this.atlas.sign,
			size: [800, 400],
		}, {
			actions: [
				{ name: "read", message: `I read: "This is the entrance of the impossible room. It's impossible to get in, and impossible to get out."` },
			],
		});

		engine.spriteCollection.create({
			name: "graffiti",
			anim: this.atlas.smokingsign,
			size: [800, 400],
		}, {
			actions: [
				{ name: "read", message: `It says: "Smoking will kill you". Hum... I don't believe so.` },
			],
		});

		engine.spriteCollection.create({
			name: "cigarette",
			anim: this.atlas.cigarette,
			size: [800, 400],
		}, {
			actions: [
				{ name: "look", message: `It's a half smoked cigarette butt on the ground.` },
				{ name: "pickup", message: `Sure, ${I}'ll pickup this cigarette butt on the ground, half smoked by a random person.`,
					action: item => {
						item.changeOpacity(0, engine.lastTime);
						this.addToInventory("cigarette");
						engine.playAudio("audio/pickup.mp3", .3);
						this.showBubble(item.pendingMessage);
						item.pendingMessage = null;
					}
				}
			],
		});

		this.mat = engine.spriteCollection.create({
			name: "mat",
			anim: this.atlas.mat,
			size: [800, 400],
		}, {
			actions: [
				{ name: "look", condition: mat => !mat.opened, message: `It's a mat in front of the entrance. It says: "You're welcome to try."` },
				{ name: "look", condition: mat => mat.opened && !mat.pickedKey, message: `There's a key. Should ${I} pick it up?` },
				{ name: "look", condition: mat => mat.opened && mat.pickedKey, message: `Nothing left but dust under the mat.` },
				{ name: "pull", condition: mat => !mat.opened, message: mat => `How ${mat.sawkey ? "unsurprising" : "surprising"}, there's a key under the mat!`,
					action: mat => {
						mat.sawkey = true;
						engine.playAudio("audio/hit.mp3", .5);
						mat.changeAnimation(this.atlas.mat_pulling, engine.lastTime);
					}
				},
				{ name: "pickup key", condition: mat => mat.opened && !mat.pickedKey, message: () => this.entrance.unlockedOnce ? `It's the key that unlocks the entrance to ${this.title.innerText}` : `I wonder where that key fits...`,
					action: mat => {
						mat.pickedKey = true;
						mat.changeAnimation(this.atlas.mat_picked_key, engine.lastTime);
						this.addToInventory("key");
						engine.playAudio("audio/pickup.mp3", .3);
						this.showBubble(mat.pendingMessage);
						mat.pendingMessage = null;
					}
				},
				{ name: "put back key", condition: entrance => this.selectedItem === "key",
					item: "key",
					command: (item, target) => `put ${target.name} under the ${item.name}`,
					action: mat => {
						this.removeFromInventory("key")
						engine.playAudio("audio/hit.mp3", .5);
						delete mat.pickedKey;
						delete mat.opened;
						mat.changeAnimation(this.atlas.mat, engine.lastTime);
					},
				},
			],
			onFrame: {
				2: mat => {
					if (!mat.opened) {
						mat.changeAnimation(this.atlas.mat_pulled, engine.lastTime);
						mat.opened = true;
						if (mat.pendingMessage) {
							this.showBubble(mat.pendingMessage);
							mat.pendingMessage = null;
						}
					}
				},
			},
		});

		this.addMonkor();

//		console.log(gl);
		document.getElementById("title").style.opacity = .5;

		// this.score = parseInt(localStorage.getItem("score") || 0);
		// this.chocolate = parseInt(localStorage.getItem("chocolate") || 0);
		// this.dinoCount = parseInt(localStorage.getItem("dino") || 0);

		this.title = document.getElementById("title");
		document.getElementById("im").innerText = "THE IMPOSSIBLE ROOM";

		this.addToInventory("note");

		engine.chrono.tick("done entrance initialization");		
	}

	onMouseTitle(e) {
		switch(e.type) {
			case "click":
				if (!this.active()) {
					return;
				}
				const gameTitle = this.inventoryDetails["game title"];
				if (this.selectedItem) {
					const itemDetails = this.inventoryDetails[this.selectedItem];
					const action = this.getActionWithItem(gameTitle, itemDetails);
					this.performAction(action, gameTitle);
				} else {
					this.selectTarget(gameTitle);
					this.showActions(gameTitle);
				}
				break;
			case "mouseover":
				this.checkItem(this.inventoryDetails.title);
				break;
			case "mouseout":
				this.checkItem(null);
				break;
		}
	}
}
