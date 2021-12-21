class SoundRoom extends GameCore {
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
			boombox: await engine.addTexture(
				{
					url: "assets/sound-room.png",
					collision_url: "assets/sound-room.png",
					texture_url: "assets/skin-texture.jpg",
					texture_alpha: .20,
					texture_blend: "source-atop",
					cols: 4, rows: 7,
					range: [0],
				}),
			soundWaves: await engine.addTexture(
				{
					url: "assets/sound-room.png",
					collision_url: "assets/sound-room.png",
					cols: 4, rows: 7,
					range: [1, 2],
					frameRate: 2,
				}),
			upButton: await engine.addTexture(
				{
					url: "assets/sound-room.png",
					collision_url: "assets/sound-room.png",
					cols: 4, rows: 7,
					range: [3],
				}),
			upButtonHighLight: await engine.addTexture(
				{
					url: "assets/sound-room.png",
					collision_url: "assets/sound-room.png",
					cols: 4, rows: 7,
					range: [4],
				}),
			upButtonPushed: await engine.addTexture(
				{
					url: "assets/sound-room.png",
					collision_url: "assets/sound-room.png",
					cols: 4, rows: 7,
					range: [5],
				}),
			digit: {
				' ': await engine.addTexture(
					{
						url: "assets/sound-room.png",
						collision_url: "assets/sound-room.png",
						cols: 4, rows: 7,
						range: [6],
					}),
				0: await engine.addTexture(
					{
						url: "assets/sound-room.png",
						collision_url: "assets/sound-room.png",
						cols: 4, rows: 7,
						range: [7],
					}),
				1: await engine.addTexture(
					{
						url: "assets/sound-room.png",
						collision_url: "assets/sound-room.png",
						cols: 4, rows: 7,
						range: [8],
					}),
				2: await engine.addTexture(
					{
						url: "assets/sound-room.png",
						collision_url: "assets/sound-room.png",
						cols: 4, rows: 7,
						range: [9],
					}),
				3: await engine.addTexture(
					{
						url: "assets/sound-room.png",
						collision_url: "assets/sound-room.png",
						cols: 4, rows: 7,
						range: [10],
					}),
				4: await engine.addTexture(
					{
						url: "assets/sound-room.png",
						collision_url: "assets/sound-room.png",
						cols: 4, rows: 7,
						range: [11],
					}),
				5: await engine.addTexture(
					{
						url: "assets/sound-room.png",
						collision_url: "assets/sound-room.png",
						cols: 4, rows: 7,
						range: [12],
					}),
				6: await engine.addTexture(
					{
						url: "assets/sound-room.png",
						collision_url: "assets/sound-room.png",
						cols: 4, rows: 7,
						range: [13],
					}),
				7: await engine.addTexture(
					{
						url: "assets/sound-room.png",
						collision_url: "assets/sound-room.png",
						cols: 4, rows: 7,
						range: [14],
					}),
				8: await engine.addTexture(
					{
						url: "assets/sound-room.png",
						collision_url: "assets/sound-room.png",
						cols: 4, rows: 7,
						range: [15],
					}),
				9: await engine.addTexture(
					{
						url: "assets/sound-room.png",
						collision_url: "assets/sound-room.png",
						cols: 4, rows: 7,
						range: [16],
					}),

			},
			monkey: await engine.addTexture(
				{
					url: "assets/sound-room.png",
					collision_url: "assets/sound-room.png",
					texture_url: "assets/skin-texture.jpg",
					texture_alpha: .20,
					texture_blend: "source-atop",
					cols: 4, rows: 7,
					range: [17],
				}),
			monkey_scratch: await engine.addTexture(
				{
					url: "assets/sound-room.png",
					collision_url: "assets/sound-room.png",
					texture_url: "assets/skin-texture.jpg",
					texture_alpha: .20,
					texture_blend: "source-atop",
					cols: 4, rows: 7,
					range: [18, 19],
					frameRate: 5,
				}),
			monkey_surprised: await engine.addTexture(
				{
					url: "assets/sound-room.png",
					collision_url: "assets/sound-room.png",
					texture_url: "assets/skin-texture.jpg",
					texture_alpha: .20,
					texture_blend: "source-atop",
					cols: 4, rows: 7,
					range: [20],
				}),
			monkey_dance: await engine.addTexture(
				{
					url: "assets/sound-room.png",
					collision_url: "assets/sound-room.png",
					texture_url: "assets/skin-texture.jpg",
					texture_alpha: .20,
					texture_blend: "source-atop",
					cols: 4, rows: 7,
					range: [21,24],
					frameRate: 3.951612903225806,//4.21073,
				}),
			butler_dance: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [49, 50],
					frameRate: 3.951612903225806,//4.21073,					
				}),
		};

		this.backwall = this.spriteFactory.create({
			anim: this.atlas.backwall,
			size: [800, 400],
		});
		this.spriteFactory.create({
			anim: this.atlas.side_doors,
			size: [800, 400],
		});

		this.code = new Array(8).fill(' ');
		this.code.forEach((_,index) => {
			if (index === 4) {
				return;
			}
			const onMouseDown = () => {
				const d = ((this.code[index] || 0) + 1) % 10;
				this.code[index] = d;
				digit.changeAnimation(this.atlas.digit[d], this.engine.lastTime);
				this.audio.beep.play();
				this.monkor.goal.x = this.monkor.x;		
				this.monkor.goal.y = this.monkor.y;
				this.onCodeChange();	
			};

			const digit = this.spriteFactory.create({
				anim: this.atlas.digit[' '],
				size: [800, 400],
				x: index * 70,
				y: -10,
			}, {
				onMouseDown,
			});
			this.spriteFactory.create({
				anim: this.atlas.upButton,
				size: [800, 400],
				x: index * 70,
				y: -5,
			}, {
				onMouseDown,
			});
		});


		this.doorBack = this.spriteFactory.create({
			name: "Exit",
			anim: this.atlas.left_door,
			size: [800, 400],
		}, {
		});

		this.doorForwardOpened = this.spriteFactory.create({
			name: "Next Room",
			anim: this.atlas.right_door_opened,
			size: [800, 400],
			opacity: 0,			
		}, {
			actions: [
				{ name: "walk through",
					action: forward_door => {
						this.walkThrough();
					},
				},
			],
		});

		const Messire = gender === "T" ? "Messires" : gender === "W" ? "Madame" : "Messire";
		const messire = gender === "T" ? "messires" : gender === "W" ? "madame" : "messire";
		const me = gender === "T" ? "us" : "me";
		const my = gender === "T" ? "our" : "my";

		const moreHints = [
			"",
			`I really like the music in this room. It's different from the other rooms.`,
			`There are four digits on the left, and three on the right. That must mean something.`,
			`One, one, one, three, two, one, zero... Those are genius lyrics.`,
		];

		this.butler = this.spriteFactory.create({
			name: "Nicolas",
			anim: this.atlas.butler,
			x: 170, y: 340,
			size: [96,192],
			hotspot: [24,192],
		}, {
			actions: [
				{ name: "talk",
					action: butler => {
						this.monkor.goal.x = this.butler.x < this.monkor.x ? this.butler.x - 20 : this.butler.x + 20;
						this.startDialog(butler, [
							{
								message: `Yes, ${messire}?`,
								voiceName: "Thomas",
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => butler.talking = 0,
							},
							{
								responses: [
									{
										response: "Is this the impossible room?",
										topic: "impossible",
									},
									{
										condition: () => !this.hintIndex,
										response: `Can you give ${me} a hint?`,
										topic: "hint",
									},
									{
										condition: () => this.hintIndex,
										response: () => this.hintIndex === moreHints.length - 1 ? `${I} suck at this. Just tell ${me} what to do!` : `Can you give ${me} another hint?`,
										topic: "more_hint"
									},
									{
										response: `${I}'ll be on ${my} way`,
									},
								],
							},
							{
								message: `Au revoir, ${messire}.`,
								voiceName: "Thomas",
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => butler.talking = 0,
								exit: true,
							},
							{
								topic: "hint",
								message: `Let's just listen to the music from the boombox.`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => butler.talking = 0,
							},
							{
								message: `It sounds better with headphones.`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => {
									butler.talking = 0;
									if (this.allowExtraHints()) {
										this.hintIndex = ((this.hintIndex || 0) + 1) % moreHints.length;
									}
								},
								exit: true,
							},
							{
								topic: "more_hint",
								message: () => moreHints[this.hintIndex],
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => {
									butler.talking = 0;
									this.hintIndex = ((this.hintIndex || 0) + 1) % moreHints.length;
								},
								exit: true,
							},
							{
								topic: "unwanted-item",
								message: `No thank you, ${messire}.`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => {
									butler.talking = engine.lastTime;
								},
								onEnd: butler => {
									butler.talking = 0;
								},
								next: previousIndex => previousIndex,
							},
							{
								topic: "impossible",
								message: `No ${messire}, this is not yet the impossible room.`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => {
									butler.talking = engine.lastTime;
								},
								onEnd: butler => {
									butler.talking = 0;
								},
							},
							{
								message: "This is called the Music Room.",
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => {
									butler.talking = engine.lastTime;
								},
								onEnd: butler => {
									butler.talking = 0;
								},
							},
							{
								message: `This room has a boombox for playing music.`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => {
									butler.talking = engine.lastTime;
								},
								onEnd: butler => {
									butler.talking = 0;
								},
							},
						]);
					},
				},
			],
		}, butler => {
			butler.goal = {x: butler.x, y: butler.y};
		});
		this.doorForwardClosed = this.spriteFactory.create({
			anim: this.atlas.right_door,
			size: [800, 400],
		});

		const I = gender === "T" ? "We" : "I";

		this.sceneData.monkor = this.sceneData.monkor || { x: 120, y: 350 };
	}

	onCodeChange() {
		//1110 132
		const thecode = "1110 132";
		const code = this.code.join("");
		if (code !== thecode) {
			this.setRightOpened(false);
		}
		clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			const code = this.code.join("");
			if (code === thecode) {
				this.setRightOpened(true);
				this.audio.door.play();
			}
		}, 2000);
	}

	updateHost(time) {
		const goalX = typeof(this.butler.goal.x) == "function" ? this.butler.goal.x(this.butler) : this.butler.goal.x;
		const goalY = typeof(this.butler.goal.y) == "function" ? this.butler.goal.y(this.butler) : this.butler.goal.y;
		const dx = goalX - this.butler.x;
		const dy = goalY - this.butler.y;
		const dist = Math.sqrt(dx * dx + dy * dy);
		if (dist > 5) {
			this.butler.changePosition(this.butler.x + dx / dist, this.butler.y + dy / dist, this.butler.z, time);
			if (dx < 0) {
				this.butler.changeAnimation(this.atlas.butler_walk_left, time);
			} else {
				this.butler.changeAnimation(this.atlas.butler_walk_right, time);				
			}
			this.butler.stillTime = 0;
		} else {
			if (this.butler.shakingHands) {
				if (!this.butler.talking) {
					this.butler.changeAnimation(this.monkor.x < this.butler.x ? this.atlas.butler_shake_hands_left : this.atlas.butler_shake_hands_right, this.butler.shakingHands || time);
				} else {
					this.butler.changeAnimation(this.monkor.x < this.butler.x ? this.atlas.butler_shake_hands_talk_left : this.atlas.butler_shake_hands_talk_right, this.butler.shakingHands || time);					
				}
			} else {
				const dxToMonkor = this.butler.x - this.monkor.x;
				const dyToMonkor = this.butler.y - this.monkor.y;
				const distToMonkor = Math.sqrt(dxToMonkor * dxToMonkor + dyToMonkor * dyToMonkor);
				if (this.butler.talking) {
					this.butler.changeAnimation(this.monkor.x < this.butler.x ? this.atlas.butler_talk_left : this.atlas.butler_talk_right, time);
				} else if (this.dialog) {
					this.butler.changeAnimation(this.monkor.x < this.butler.x ? this.atlas.butler_still_left : this.atlas.butler_still_right, time);
				} else if (this.butler.dancing) {
					this.butler.changeAnimation(this.atlas.butler_dance, time);
				} else {
					this.butler.changeAnimation(this.atlas.butler, time);					
				}
			}
			if (!this.butler.stillTime) {
				this.butler.stillTime = time;
			} else if (time - this.butler.stillTime > 2000) {
				if (this.butler.onStill) {
					const onStill = this.butler.onStill;
					this.butler.onStill = null;
					onStill(this.butler, time);
				}
			}
		}
	}

	addMonkor() {
		super.addMonkor();
		this.spriteFactory.create({
			anim: this.atlas.backwallforeground,
			size: [800, 400],
		});
		this.boombox = this.spriteFactory.create({
			name: "boombox",
			anim: this.atlas.boombox,
			size: [400, 200],
			hotspot: [200, 164],
			x: 400, y: 373,
		}, {
			actions: [
				{
					name: "look",
					message: boombox => boombox.playing ? "The boombox is playing some music." : "There's a boombox in the middle of the room, stared at by two monkeys. It doesn't have any buttons.",
				},
			],
		});
		this.leftMonkey = this.spriteFactory.create({
			name: "monkey",
			anim: this.atlas.monkey,
			size: [400, 200],
			hotspot: [200, 164],
			x: 400, y: 373,
		}, {
			actions: [
				{
					name: "look",
					message: monkey => monkey.dancing && this.engine.lastTime - monkey.dancing > 2000 ? "That monkey's got some moves!" : "The monkey seems to be waiting for something.",
				},
			],
		});
		this.rightMonkey = this.spriteFactory.create({
			name: "monkey",
			anim: this.atlas.monkey,
			size: [400, 200],
			hotspot: [200, 164],
			x: 400, y: 373,
			direction: -1,
		}, {
			actions: [
				{
					name: "look",
					message: monkey => monkey.dancing && this.engine.lastTime - monkey.dancing > 2000 ? "That monkey's got some moves!" : "The monkey seems to be waiting for something.",
				},
			],
		});
	}

	async postInit() {
		await super.postInit();

		const audio = document.getElementById("audio");
		audio.currentTime = 0;
		this.setAudio(audio, false, .5, true);
	}

	onExit(engine) {
		const audio = document.getElementById("blinkpong");
		this.setAudio(audio, false, .5, true);
		super.onExit(engine);
	}

	getMusic() {
		return "blinkpong";
	}

	getWalkArea() {
		const {left, right, top, bottom} = this.backwall.getCollisionBox(engine.lastTime);		
		return {left, right, top: top - 15, bottom: bottom - 25};
	}

	shouldResetAudio() {
		return true;
	}

	updateMonkey(monkey, time) {
		if (!monkey.dancing || time < monkey.dancing) {
			if (!monkey.scratching || time > monkey.scratching) {
				monkey.scratching = time + Math.random() * 20000;
			} else if (monkey.scratching - time < 5000) {
				monkey.changeAnimation(this.atlas.monkey_scratch, time);
			} else {
				monkey.changeAnimation(this.atlas.monkey, time);
			}
			return;
		}
		const danceTime = time - monkey.dancing;
		if (danceTime < 2000) {
			monkey.changeAnimation(this.atlas.monkey_surprised, time);
		} else {
			monkey.changeAnimation(this.atlas.monkey_dance, time);			
		}
	}

	refresh(time, dt) {
		super.refresh(time, dt);
		this.updateHost(time);
		this.updateBoombox(time);
		this.updateMonkey(this.leftMonkey, time);
		this.updateMonkey(this.rightMonkey, time);
	}

	updateBoombox(time) {
		const sin = this.boombox.playing ? Math.sin(time / 80) : 0;
		const cos = this.boombox.playing ? Math.cos(time / 80) : 0;
		const width = 400 + sin * 20;
		const height = 200 + cos * 10;
		this.boombox.changeSize(width, height, time);
		this.boombox.changeHotSpot(width / 2, height * 164 / 200, time);
	}

	setAudio(audio, turnOn, volume, ignore) {
		super.setAudio(audio, turnOn, volume, ignore);
		this.boombox.playing = turnOn;
		if (turnOn) {
			this.leftMonkey.dancing = this.engine.lastTime + 1500;
			this.rightMonkey.dancing = this.engine.lastTime + 1500;
			this.butler.dancing = true;
			clearTimeout(this.timeout);
			clearTimeout(this.timeout2);
		} else {
			this.butler.dancing = false;
			this.timeout = setTimeout(() => {
				this.leftMonkey.dancing = 0;;
				this.leftMonkey.scratching = 0;
			}, 2000 + Math.random() * 2000);
			this.timeout2 = setTimeout(() => {
				this.rightMonkey.dancing = 0;
				this.rightMonkey.scratching = 0;
			}, 2000 + Math.random() * 2000);
		}
	}	

	setNextDoorOpened(opened) {
		this.doorForwardOpened.changeOpacity(opened?1:0, engine.lastTime);										
		this.doorForwardClosed.changeOpacity(opened?0:1, engine.lastTime);
	}

	setRightOpened(opened) {
		this.setNextDoorOpened(opened);
	}

	openLeft() {

	}

	openRight() {
		
	}

	nextLevelLeft() {
	}

	nextLevelRight() {
		if (!this.monkor.properties.joker) {
			this.achieve("The Music Room");
			// getMedal("The Music Room", this.onUnlockMedal);
		}
		this.engine.setGame(new ClueRoom());
	}
}