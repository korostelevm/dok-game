class Restroom extends GameCore {
	async init(engine, gameName) {
		await super.init(engine, gameName);

		const { gl, config } = engine;
		const { gender } = this.data;

		/* Load Audio */
		this.audio = {
			...this.audio,
			shit: new Sound("audio/player-hurt.mp3", 1),
			wipe: new Sound("audio/eat.mp3", .2),
			pee: new Sound("audio/drink.mp3", .5),
			flush: new Sound("audio/diving.mp3", 1),
		};

		const genderToShitUrl = {
			M: "assets/monkor-shit.png",
			W: "assets/nuna-shit.png",
			T: "assets/twin-shit.png",
		};
		const I = gender === "T" ? "We" : "I";
		const my = gender === "T" ? "our" : "my";
		const My = gender === "T" ? "Our" : "My";


		/* Load image */
		this.atlas = {
			...this.atlas,
			ground: await engine.addTexture(
				{
					collision_url: "assets/toilet-room-ground.png",
				}),
			backwall: await engine.addTexture(
				{
					url: "assets/toilet-room.png",
					texture_url: "assets/backwall.jpg",
					collision_url: "assets/toilet-collision.png",
					texture_alpha: .25,
					texture_blend: "luminosity",
					cols:1,rows:4,
					range:[0],
				}),
			toilet_opening: await engine.addTexture(
				{
					url: "assets/toilet-room.png",
					texture_url: "assets/backwall.jpg",
					collision_url: "assets/toilet-collision.png",
					texture_alpha: .25,
					texture_blend: "luminosity",
					cols:1,rows:4,
					frameRate: 4,
					range:[1, 2],
				}),
			toilet_opened: await engine.addTexture(
				{
					url: "assets/toilet-room.png",
					texture_url: "assets/backwall.jpg",
					collision_url: "assets/toilet-collision.png",
					texture_alpha: .25,
					texture_blend: "luminosity",
					cols:1,rows:4,
					range:[2],
				}),
			water_faucet: await engine.addTexture(
				{
					collision_url: "assets/water-faucet-collision.png",
				}),
			exit: await engine.addTexture(
				{
					collision_url: "assets/toilet-exit-collision.png",
				}),
			monkor_shit: await engine.addTexture(
				{
					url: genderToShitUrl[gender],
					cols: 3, rows: 3,
				}),
			monkor_shit_push: await engine.addTexture(
				{
					url: genderToShitUrl[gender],
					cols: 3, rows: 3,
					frameRate: 2,
					range: [0, 1],
				}),
			monkor_shit_pick_paper: await engine.addTexture(
				{
					url: genderToShitUrl[gender],
					cols: 3, rows: 3,
					range: [2],
				}),
			monkor_shit_wipe: await engine.addTexture(
				{
					url: genderToShitUrl[gender],
					cols: 3, rows: 3,
					frameRate: 8,
					range: [3, 4],
				}),
			monkor_shit_talk: await engine.addTexture(
				{
					url: genderToShitUrl[gender],
					cols: 3, rows: 3,
					frameRate: 8,
					range: [5, 8],
				}),
			monkor_shit_talk_pause: await engine.addTexture(
				{
					url: genderToShitUrl[gender],
					cols: 3, rows: 3,
					frameRate: 8,
					range: [5],
				}),
			no_smoking: await engine.addTexture(
				{
					url: "assets/no-smoking.png",
					collision_url: "assets/no-smoking.png",
				}),
		};

		const [viewportWidth, viewportHeight] = config.viewport.size;

		this.backwall = this.spriteFactory.create({
			name: "bathroom",
			anim: this.atlas.backwall,
			size: [800, 400],
		}, {
			actions: [
				{ name: "open", condition: door => !door.properties.opened,
					lookup: 500,
					action: door => {
						this.audio.door.play();
						door.changeAnimation(this.atlas.toilet_opening, engine.lastTime);
					}
				},
				{ name: "close", condition: door => door.properties.opened && !this.monkor_shit.properties.sit,
					lookup: 500,
					action: door => {
						this.audio.hit.play();
						door.setProperty("opened", false);
					},
				},
				{ name: "sit", condition: door => !this.monkor_shit.properties.sit && this.backwall.properties.opened,
					action: door => {
						this.audio.pee.play();
						this.monkor_shit.setProperty("sit", true);
					},
				},
				{ name: "sing a song", condition: door => this.monkor_shit.properties.sit,
					message: () => this.randomSong(),
					action: door => {
						const seat = this.monkor_shit;
						seat.changeAnimation(this.atlas.monkor_shit_talk, engine.lastTime);
						this.showBubble(door.pendingMessage, () => {
							setTimeout(() => {
								this.monkor_shit.setProperty("dump", engine.lastTime);
							}, 500);
						});
					},
				},
				{ name: "stand up", condition: door => this.monkor_shit.properties.sit && !this.monkor_shit.wipeTime && !this.monkor_shit.startWipe && !this.monkor.speech,
					action: door => {
						this.monkor_shit.setProperty("sit", false);
					},
				},
				{ name: "take a number 2", condition: door => this.monkor_shit.properties.sit,
					action: door => {
						this.monkor_shit.setProperty("dump", engine.lastTime);
					},
				},
				{ name: "wipe down there", condition: door => this.monkor_shit.properties.stinky_butt && !this.monkor_shit.properties.nopaper && this.monkor_shit.properties.sit,
					action: door => {
						const seat = this.monkor_shit;
						seat.setProperty("nopaper", true);
						seat.changeAnimation(this.atlas.monkor_shit_pick_paper, engine.lastTime);
						setTimeout(() => {
							seat.changeAnimation(this.atlas.monkor_shit_talk, engine.lastTime);
							this.showBubble(`There's no paper left.`);
						}, 1000);
					},
				},
				{ name: "wipe with hand", condition: door => this.monkor_shit.properties.stinky_butt && this.monkor_shit.properties.nopaper && this.monkor_shit.properties.sit,
					action: door => {
						const seat = this.monkor_shit;
						seat.changeAnimation(this.atlas.monkor_shit_wipe, engine.lastTime);
						seat.startWipe = engine.lastTime;
						this.monkor.setProperty("stinky_hand", true);
						seat.setProperty("stinky_butt", null);
					},
				},
				{ name: "flush", condition: door => door.properties.opened && !this.monkor_shit.properties.sit && this.monkor_shit.properties.has_shit,
					lookup: 500,
					action: door => {
						const seat = this.monkor_shit;
						seat.setProperty("has_shit", null);
						this.audio.flush.play();						
					},
				},
				{ name: "look", condition: door => !door.properties.opened, message: "It's the door to the bathroom.",
					lookup: 500,
				},
				{ name: "look", condition: door => door.properties.opened && !this.monkor_shit.properties.sit && !this.monkor_shit.properties.has_shit, message: "There's nothing in the toilet.",
					lookup: 500,
				},
				{ name: "look", condition: door => door.properties.opened && !this.monkor_shit.properties.sit && this.monkor_shit.properties.has_shit === "turd", message: "There's a big turd in the toilet",
					lookup: 500,
				},
				{ name: "look", condition: door => door.properties.opened && !this.monkor_shit.properties.sit && this.monkor_shit.properties.has_shit === "key", message: `I see a key. ${I} must have pooped it out of ${my} body.`,
					lookup: 500,
					action: door => {
						const seat = this.monkor_shit;
						seat.setProperty("saw_key", true);
						this.showBubble(door.pendingMessage);
						door.pendingMessage = null;
					},
				},
				{ name: "pick up key", condition: door => door.properties.opened && !this.monkor_shit.properties.sit && this.monkor_shit.properties.saw_key && this.monkor_shit.properties.has_shit === "key",
					lookup: 500,
					action: door => {
						const seat = this.monkor_shit;
						seat.setProperty("saw_key", null);
						seat.setProperty("stinky_key", true);
						seat.setProperty("has_shit", null);
						this.monkor.setProperty("stinky_hand", true);

						this.addToInventory("key_turd");
						this.audio.pickup.play();
					},
				},
			],
			onChange: {
				opened: (door, opened) => {
					door.changeAnimation(opened ? this.atlas.toilet_opened : this.atlas.backwall, engine.lastTime);
				},
			},
			onFrame: {
				2: door => {
					if (!door.properties.opened) {
						door.setProperty("opened", true);
					}
				},
			},
		});
		this.ground = this.spriteFactory.create({
			name: "ground",
			anim: this.atlas.ground,
			size: [800, 400],
		});
		this.water_faucet = this.spriteFactory.create({
			name: "water sink",
			anim: this.atlas.water_faucet,
			size: [800, 400],
		}, {
			actions: [
				{ name: "wash hands",
					action: door => {
						this.monkor.setProperty("stinky_hand", null);
						this.audio.flush.play();
						setTimeout(() => {
							this.showBubble(`${My} hands are clean.`, () => {
							});
						}, 1000);
					},
					lookup: 1000,
				},
				{ name: "wash the keys", condition: entrance => this.selectedItem === "key_turd",
					lookup: 500,
					item: ["key_turd"],
					command: (item, target) => `wash the ${item.name}.`,
					action: entrance => {
						this.audio.flush.play();
						this.removeFromInventory("key_turd");
						this.monkor.setProperty("stinky_hand", null);
						this.addToInventory("key");
						setTimeout(() => {
							this.showBubble(`${I} washed the key, and my hands too.`, () => {
							});
						}, 1000);
					},
				},
				{ name: "look in the mirror", message: `Good thing ${I} shaved this morning.` },
			],
		});
		this.exit = this.spriteFactory.create({
			name: "Exit",
			anim: this.atlas.exit,
			size: [800, 400],
		}, {
			actions: [
				{
					name: "exit",
					action: exit => {
						this.monkor.setProperty("paused", engine.lastTime);
						this.monkor.goal.x = 900;
					},
				},
			],
		});
		this.monkor_shit = this.spriteFactory.create({
			name: "Monkor on toilet",
			anim: this.atlas.monkor_shit,
			x: 325, y: 190,
			size: [256, 256],
			hotspot: [128,128],
			opacity: 0,
		}, {
			onChange: {
				sit: (seat, sitting) => {
					if (this.monkor) {
						seat.changeOpacity(sitting ? 1 : 0, engine.lastTime);
						this.monkor.changeOpacity(sitting ? 0 : 1, engine.lastTime);
						this.monkor.busy = sitting ? engine.lastTime : 0;
						seat.changeAnimation(this.atlas.monkor_shit, engine.lastTime);
						this.setInventoryVisibility(!sitting);
						this.setControlVisibility(!sitting);
						this.achieve("The Restroom");
						// getMedal("The Restroom", this.onUnlockMedal);
					}
				},
				dump: (seat, dump) => {
					if (dump) {
						this.monkor_shit.shitTime = engine.lastTime;
						seat.setProperty("stinky_butt", engine.lastTime);
						if (this.data.ateKey) {
							seat.setProperty("has_shit", "key");
							delete this.data.ateKey;
						} else if (!seat.properties.has_shit) {
							seat.setProperty("has_shit", "turd");
						}
						seat.changeAnimation(this.atlas.monkor_shit_push, engine.lastTime);
					}
				},
			},
			onFrame: {
				0: (seat, previousFrame) => {
					// if (previousFrame !== seat.frame && seat.shitTime && engine.lastTime - seat.shitTime > 2000) {
					// 	seat.shitTime = 0;
					// 	this.monkor_shit.wipeTime = engine.lastTime;
					// 	this.monkor_shit.changeAnimation(this.atlas.monkor_shit_pick_paper, engine.lastTime);
					// }
					if (previousFrame !== seat.frame) {
						seat.changeAnimation(this.atlas.monkor_shit, engine.lastTime);
					}
				},
				1: (seat, previousFrame) => {
					if (previousFrame !== seat.frame) {
						this.audio.shit.play();
					}
				},
				4: (seat, previousFrame) => {
					if (seat.frame !== previousFrame) {
						this.audio.wipe.play();
					}
					if (seat.startWipe && engine.lastTime - seat.startWipe > 2000) {
						this.monkor_shit.setProperty("sit", false);
						seat.startWipe = 0;
						this.showBubble(`${I} better wash ${my} hands.`, () => {
						});

					}
				},
				5: (seat, previousFrame) => {
					const finishedSpeech = this.finishedSpeech(this.monkor);
					// const anim = this.atlas.monkor_shit_talk;
					const anim = finishedSpeech && finishedSpeech !== 1 ? this.atlas.monkor_shit : !finishedSpeech && this.monkor.speechPause <= 0 ? this.atlas.monkor_shit_talk : this.atlas.monkor_shit_talk_pause;
					seat.changeAnimation(anim, engine.lastTime, anim == this.atlas.monkor_shit_talk ? this.monkor.speechStarted : 0);
				},
				6: 5,
				7: 5,
				8: 5,
			},
		});

		this.no_smoking = this.spriteFactory.create({
			name: "no smoking sign",
			anim: this.atlas.no_smoking,
			size: [50, 75],
			x: 50, y: 150,
		}, {
			actions: [
				{ name: "look",
					message: () => `It's a no smoking sign. It's ok, ${I} will dispose of my cigarette.`,
					 lookup: 500,
				},				
			],
		});

		this.sceneData.monkor = this.sceneData.monkor || { x: 50, y: 300 };
	}

	randomSong() {
		const songs = [
			"I'm just sitting on the dock of the bay. Wasting time.",
			"My hump my hump my hump, my lovely little lumps.",
			"Ah, push it. Ah, push it. Ooh, baby baby.",
			"Wake up. Wake up and smell the roses.",
			"I wanna push you down. Well I will, well I will.",
			"Smooth like butter. Like a criminal undercover. Gonna pop out trouble.",
		];
		return songs[Math.floor(Math.random()*songs.length)];
	}

	canRunLeft() {
		return true;
	}



	getWalkArea() {
		return this.ground.getCollisionBox(engine.lastTime);		
	}

	nextLevelRight() {
		this.engine.setGame(new Lobby());
	}
}