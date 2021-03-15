class Entrance extends GameCore {
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

		this.entrance = this.spriteFactory.create({
			name: "entrance door",
			anim: this.atlas.entrance,
			size: [800, 400],
		}, {
			defaultCommand: (item, target) => target.properties.unlocked ? `use ${item.name} on ${target.name}` : `unlock ${target.name} with ${item.name}`,
			actions: [
				{ name: "look", condition: entrance => !entrance.properties.opened,
					message: () => `There's a door, that leads to ${this.title.innerText}` },
				{ name: "open", condition: entrance => !entrance.properties.unlocked, message: `It's locked.` },
				{ name: "unlock", condition: entrance => this.selectedItem === "key" && !entrance.properties.unlocked,
					message: `Yeah! ${I} unlocked the door.`,
					item: "key",
					command: (item, target) => `unlock ${target.name} with ${item.name}.`,
					action: entrance => {
						engine.playAudio("audio/dud.mp3", 1);
						entrance.setProperty("unlocked", true);
						entrance.setProperty("unlockedOnce", true);
						setTimeout(() => {
							this.showBubble(entrance.pendingMessage);
							entrance.pendingMessage = null;
						}, 500);
					},
				},
				{ name: "lock", condition: entrance => this.selectedItem === "key" && entrance.properties.unlocked,
					message: `${I} locked the door.`,
					item: "key",
					command: (item, target) => `lock ${target.name} with ${item.name}.`,
					action: entrance => {
						engine.playAudio("audio/dud.mp3", 1);
						entrance.setProperty("unlocked", false);
						entrance.setProperty("opened", false);
						entrance.changeAnimation(this.atlas.entrance, engine.lastTime);
						setTimeout(() => {
							this.showBubble(entrance.pendingMessage);
							entrance.pendingMessage = null;
						}, 500);
					},
				},
				{ name: "close", condition: entrance => entrance.properties.unlocked && entrance.properties.opened,
					action: entrance => {
						engine.playAudio("audio/hit.mp3", .5);
						entrance.setProperty("opened", false);
					},
				},
				{ name: "open", condition: entrance => entrance.properties.unlocked && !entrance.properties.opened,
					action: entrance => {
						engine.playAudio("audio/door.mp3", .3);
						entrance.changeAnimation(this.atlas.entrance_open, engine.lastTime);
					},
				},
				{ name: "enter", condition: entrance => entrance.properties.opened && this.title.innerText.toLowerCase().contains("impossible"), message: () => ` ${I} don't want to go in, it's ${this.title.innerText}! ${I} might never escape!` },
				{ name: "enter", condition: entrance => entrance.properties.opened && !this.title.innerText.toLowerCase().contains("impossible"), message: () => `I guess this is not the impossible room. This is ${this.title.innerText}. Okay, ${I} shall go in.`,
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
			onChange: {
				opened: (entrance, opened) => {
					entrance.changeAnimation(opened ? this.atlas.entrance_opened : this.atlas.entrance, engine.lastTime);
				},
			},
			onFrame: {
				6: entrance => {
					if (!entrance.properties.opened) {
						entrance.setProperty("opened", true);
					}
				},
			},
		});

		this.spriteFactory.create({
			name: "sign",
			anim: this.atlas.sign,
			size: [800, 400],
		}, {
			actions: [
				{ name: "read", message: `I read: "This is the entrance of the impossible room. It's impossible to get in, and impossible to get out."` },
			],
		});

		this.spriteFactory.create({
			name: "graffiti",
			anim: this.atlas.smokingsign,
			size: [800, 400],
		}, {
			actions: [
				{ name: "read", message: `It says: "Smoking will kill you". Hum... I don't believe so.` },
			],
		});

		this.spriteFactory.create({
			name: "cigarette",
			anim: this.atlas.cigarette,
			size: [800, 400],
		}, {
			actions: [
				{ name: "look", message: `It's a half smoked cigarette butt on the ground.` },
				{ name: "pickup", message: `Sure, ${I}'ll pickup this cigarette butt on the ground, half smoked by a random person.`,
					action: item => {
						item.setProperty("pickedUp", true);
						this.addToInventory("cigarette");
						engine.playAudio("audio/pickup.mp3", .3);
						this.showBubble(item.pendingMessage);
						item.pendingMessage = null;
					},
				}
			],
			onChange: {
				pickedUp: (item, value) => {
					item.changeOpacity(value ? 0 : 1, engine.lastTime);
				},
			},
		});

		this.mat = this.spriteFactory.create({
			name: "mat",
			anim: this.atlas.mat,
			size: [800, 400],
		}, {
			actions: [
				{ name: "look", condition: mat => !mat.properties.pulled, message: `It's a mat in front of the entrance. It says: "You're welcome to try."` },
				{ name: "look", condition: mat => mat.properties.pulled && !mat.properties.pickedKey, message: `There's a key. Should ${I} pick it up?` },
				{ name: "look", condition: mat => mat.properties.pulled && mat.properties.pickedKey, message: `Nothing left but dust under the mat.` },
				{ name: "pull", condition: mat => !mat.properties.pulled, message: mat => `How ${mat.properties.sawkey ? "unsurprising" : "surprising"}, there's a key under the mat!`,
					action: mat => {
						mat.setProperty("sawkey", true);
						engine.playAudio("audio/hit.mp3", .5);
						mat.changeAnimation(this.atlas.mat_pulling, engine.lastTime);
					}
				},
				{ name: "pickup key", condition: mat => mat.properties.pulled && !mat.properties.pickedKey, message: () => this.entrance.properties.unlockedOnce ? `It's the key that unlocks the entrance to ${this.title.innerText}` : `I wonder where that key fits...`,
					action: mat => {
						mat.setProperty("pickedKey", true);
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
						mat.setProperty("pickedKey", false);
						mat.setProperty("pulled", false);
						mat.changeAnimation(this.atlas.mat, engine.lastTime);
					},
				},
			],
			onChange: {
				pickedKey: (mat, value) => {
					const anim = !mat.properties.pulled ? this.atlas.mat
						: mat.properties.pickedKey ? this.atlas.mat_picked_key
						: this.atlas.mat_pulled;
					mat.changeAnimation(anim, engine.lastTime);
				},
				pulled: (mat, value) => {
					const anim = !mat.properties.pulled ? this.atlas.mat
						: mat.properties.pickedKey ? this.atlas.mat_picked_key
						: this.atlas.mat_pulled;
					mat.changeAnimation(anim, engine.lastTime);
				},
			},
			onFrame: {
				2: mat => {
					if (!mat.properties.pulled) {
						mat.setProperty("pulled", true);
						if (mat.pendingMessage) {
							this.showBubble(mat.pendingMessage);
							mat.pendingMessage = null;
						}
					}
				},
			},
		});

		this.addMonkor();

		this.title = document.getElementById("title");
		this.title.style.opacity = .5;
		document.getElementById("im").innerText = this.properties.title || "THE IMPOSSIBLE ROOM";

		if (!this.inventory.contains("note")) {
			this.addToInventory("note");
		}

		engine.chrono.tick("done entrance initialization");		
	}

	onExit(engine) {
		this.setProperty("title", document.getElementById("im").innerText);
		this.title.style.opacity = 0;
		super.onExit(engine);
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
