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
			backwallforeground: await engine.addTexture(
				{
					url: "assets/lobby.png",
					collision_url: "assets/lobby-collision.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .15,
					texture_blend: "source-atop",
					cols:4,rows:7,
					range:[23],
				}),			
			plants: await engine.addTexture(
				{
					url: "assets/lobby.png",
					texture_url: "assets/skin-texture.jpg",
					texture_alpha: .20,
					texture_blend: "source-atop",
					cols:4,rows:7,
					range:[22],
				}),			
			side_doors: await engine.addTexture(
				{
					url: "assets/lobby.png",
					collision_url: "assets/lobby-collision.png",
					cols:4,rows:7,
					range:[1],
				}),			
			lobby_dude: await engine.addTexture(
				{
					url: "assets/lobby.png",
					collision_url: "assets/lobby-collision.png",
					cols:4,rows:7,
					range:[17],
				}),
			lobby_dude_talking: await engine.addTexture(
				{
					url: "assets/lobby.png",
					collision_url: "assets/lobby-collision.png",
					cols:4,rows:7,
					range:[17, 18],
					frameRate: 10,
				}),
			lobby_front: await engine.addTexture({
					url: "assets/lobby.png",
					collision_url: "assets/lobby-collision.png",
					texture_url: "assets/skin-texture.jpg",
					texture_alpha: .05,
					texture_blend: "source-atop",
					cols:4,rows:7,
					range:[16],
				}),
			gum: await engine.addTexture(
				{
					url: "assets/gum.png",
					collision_url: "assets/gum.png",
				}),
		};

		const I = gender === "T" ? "We" : "I";


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
				{ name: "exit", condition: dick => !this.properties.calledHost || this.butler.properties.nextRoomAvailable,
					action: exit => {
						this.monkor.setProperty("paused", engine.lastTime);
						this.monkor.goal.x = -100;
					},
				},
			],
		});


		this.lobby_dude = this.spriteFactory.create({
			name: "Dick the Concierge",
			anim: this.atlas.lobby_dude,
			size: [800, 400],
		}, {
			bubbleTop: 40,
			actions: [
				{ name: "look", message: "There's a man sitting behind the counter. He's not wearing any pants!",
					lookup: 500,
				},
				{ name: "talk", lookup: 2000, condition: dick => this.properties.calledHost,
					action: dick => {
						dick.changeAnimation(this.atlas.lobby_dude_talking, engine.lastTime);
						this.showBubble(`Just talk to the host.`, () => {
							dick.changeAnimation(this.atlas.lobby_dude, engine.lastTime);
						}, "Ralph", dick);
					},
				},
				{ name: "talk", lookup: 2000, condition: dick => !this.properties.calledHost,
					action: dick => {
						this.startDialog(dick, [
							{
								message: "How can I be of service?",
								voiceName: "Ralph",
								onStart: dick => dick.changeAnimation(this.atlas.lobby_dude_talking, engine.lastTime),
								onEnd: dick => dick.changeAnimation(this.atlas.lobby_dude, engine.lastTime),
							},
							{
								topic: "inquiry",
								responses: [
									{
										response: "Where is the impossible room?",
										topic: "impossible",
										lookup: 2000,
									},
									{
										response: "Why are you not wearing any pants?",
										topic: "pants",
										lookup: 2000,
									},
									{
										response: "I'll be on my way",
									},
								],
							},
							{
								message: "Suit yourself.",
								voiceName: "Ralph",
								onStart: dick => dick.changeAnimation(this.atlas.lobby_dude_talking, engine.lastTime),
								onEnd: dick => dick.changeAnimation(this.atlas.lobby_dude, engine.lastTime),
								exit: true,
							},
							{
								topic: "unwanted-item",
								message: `No thanks.`,
								voiceName: "Ralph",
								onStart: dick => dick.changeAnimation(this.atlas.lobby_dude_talking, engine.lastTime),
								onEnd: dick => dick.changeAnimation(this.atlas.lobby_dude, engine.lastTime),
								next: previousIndex => previousIndex,
							},
							{
								topic: "pants",
								message: "I don't need to wear pants. The counter is hiding my bottom half, so nobody can see it.",
								voiceName: "Ralph",
								onStart: dick => dick.changeAnimation(this.atlas.lobby_dude_talking, engine.lastTime),
								onEnd: dick => dick.changeAnimation(this.atlas.lobby_dude, engine.lastTime),
							},
							{
								message: "What if a player finds your downloaded image in the developer tools. They will see your indecently exposed bottom half!",
								speaker: this.monkor,
								lookup: 600,
							},
							{
								message: "Hum... I guess I didn't think of that.",
								voiceName: "Ralph",
								onStart: dick => dick.changeAnimation(this.atlas.lobby_dude_talking, engine.lastTime),
								onEnd: dick => dick.changeAnimation(this.atlas.lobby_dude, engine.lastTime),
								next: "inquiry",
							},
							{
								topic: "impossible",
								message: "You really want to enter the impossible room. You know you can't get out, right?",
								voiceName: "Ralph",
								onStart: dick => dick.changeAnimation(this.atlas.lobby_dude_talking, engine.lastTime),
								onEnd: dick => dick.changeAnimation(this.atlas.lobby_dude, engine.lastTime),
							},
							{
								responses: [
									{
										response: "You're right, what was I thinking?",
										next: "inquiry",
									},
									{
										response: "Yes, I think I want to give it a try.",
									},
								],
							},
							{
								message: "Very well. I'll call the host, and he will lead you to the impossible room.",
								voiceName: "Ralph",
								onStart: dick => dick.changeAnimation(this.atlas.lobby_dude_talking, engine.lastTime),
								onEnd: dick => dick.changeAnimation(this.atlas.lobby_dude, engine.lastTime),								
							},
							{
								message: "His name is Nicolas.",
								voiceName: "Ralph",
								onStart: dick => dick.changeAnimation(this.atlas.lobby_dude_talking, engine.lastTime),
								onEnd: dick => {
									this.setProperty("calledHost", engine.lastTime);									
									dick.changeAnimation(this.atlas.lobby_dude, engine.lastTime);
									setTimeout(() => {
										this.butler.goal.x = () => this.monkor.x + 50;
										this.butler.goal.y = () => this.monkor.y;
										this.butler.onStill = (butler, time) => {
											if (this.butler.x > 500) {
												this.monkor.setProperty("paused", engine.lastTime);
												this.monkor.goal.x = 400;
												return true;
											} else {
												this.monkor.setProperty("paused", 0);
												this.startButlerDialog(butler, time);
											}
										};
									}, 8000);
								},
							},
						]);
					},
				},
			],
		});

		this.spriteFactory.create({
			anim: this.atlas.lobby_front,
			size: [800, 400],
		});

		this.spriteFactory.create({
			name: "gum",
			anim: this.atlas.gum,
			size: [40, 40],
			x: 510, y: 315,
		}, {
			actions: [
				{ name: "look", message: `It's a half chewed gum on the ground.` },
				{ name: "pick up", message: `Sure, ${I}'ll pick up this chewing gum on the ground, half masticated by a random person.`,
					action: item => {
						item.setProperty("pickedUp", true);
						this.addToInventory("gum");
						this.audio.pickup.play();
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

		this.doorForwardOpened = this.spriteFactory.create({
			name: "Next Room",
			anim: this.atlas.right_door_opened,
			size: [800, 400],
			opacity: 0,			
		}, {
			actions: [
				{ name: "walk through", condition: () => this.butler.properties.nextRoomAvailable,
					action: forward_door => {
						this.monkor.setProperty("paused", engine.lastTime);
						this.monkor.goal.x = 900;
					},
				},
			],
		});
		this.butler = this.spriteFactory.create({
			name: "Nicolas",
			anim: this.atlas.butler,
			x: this.properties.calledHost ? 600 : 770, y: 350,
			size: [96,192],
			hotspot: [24,192],
		}, {
			actions: [
				{ name: "talk", condition: butler => butler.properties.nextRoomAvailable,
					action: butler => {
						const { gender } = this.data;
						const Messire = gender === "T" ? "Messires" : gender === "W" ? "Madame" : "Messire";
						const messire = gender === "T" ? "messires" : gender === "W" ? "madame" : "messire";
						const I = gender === "T" ? "We" : "I";
						this.monkor.goal.x = this.butler.x - 50;
						this.startDialog(butler, [
							{
								topic: "intro",
								message: `Are you ready, ${messire}?`,
								voiceName: "Thomas",
								secondsAfterEnd: 2,
								onStart: butler => {
									butler.talking = engine.lastTime;
								},
								onEnd: butler => {
									butler.talking = 0;
								},
							},
							{
								responses: [
									{
										response: `${I}'d like to shake your hands`,
										topic: "shake_hands"
									},
									{
										response: "Let's go to the impossible room.",
										topic: "take_me_there",
										onSelect: () => {
											this.butler.shakingHands = 0;
											this.monkor.shakingHands = 0;
											this.updateHost(engine.lastTime);
										},
									},
									{
										response: `${I}'d like a few minutes.`,
										onSelect: () => {
											this.butler.shakingHands = 0;
											this.monkor.shakingHands = 0;
											this.updateHost(engine.lastTime);
										},
										topic: "exit",
									},
								],
							},
							{
								topic: "shake_hands",
								message: `It is a great pleasure to have you, ${messire}.`,
								voiceName: "Thomas",
								secondsAfterEnd: 2,
								onStart: butler => {
									butler.talking = engine.lastTime;
									this.startShakingHands(engine.lastTime);
								},
								onEnd: butler => {
									butler.talking = 0;
									this.butler.shakingHands = 0;
									this.monkor.shakingHands = 0;
								},
								next: "intro",
							},							
							{
								topic: "exit",
								message: `Take your time, ${messire}.`,
								voiceName: "Thomas",
								secondsAfterEnd: 2,
								onStart: butler => {
									butler.talking = engine.lastTime;
								},
								onEnd: butler => {
									butler.talking = 0;
								},
								exit: true,
							},
							{
								topic: "take_me_there",
								message: `Please follow me, ${messire}.`,
								voiceName: "Thomas",
								secondsAfterEnd: 2,
								onStart: butler => {
									butler.talking = engine.lastTime;
								},
								onEnd: butler => {
									butler.talking = 0;
									butler.setProperty("nextRoomAvailable", engine.lastTime);

									butler.goal.x = 1000;
									butler.goal.y = 400;
									butler.onStill = () => {};
								},
								exit: true,
							},
						]);	

					},
				},
			],
		}, butler => {
			butler.goal = {
				x: butler.x,
				y: butler.y,
			};
		});
		this.doorForwardClosed = this.spriteFactory.create({
			anim: this.atlas.right_door,
			size: [800, 400],
		});

		this.sceneData.monkor = this.sceneData.monkor || { x: 120, y: 350 };

		this.removeFromInventory("key_turd");
		this.removeFromInventory("key");
		this.removeFromInventory("cigarette");

	}

	onChange(key, value) {
		if (key==="calledHost") {
			this.doorForwardOpened.changeOpacity(value?1:0, engine.lastTime);										
			this.doorForwardClosed.changeOpacity(value?0:1, engine.lastTime);
		}
	}

	startButlerDialog(butler, time) {
		const { gender } = this.data;
		const Messire = gender === "T" ? "Messires" : gender === "W" ? "Madame" : "Messire";
		const messire = gender === "T" ? "messires" : gender === "W" ? "madame" : "messire";
		const I = gender === "T" ? "We" : "I";


		this.startDialog(butler, [
			{
				message: `Hello ${messire}, and welcome to the impossible room.`,
				voiceName: "Thomas",
				secondsAfterEnd: 2,
				onStart: butler => {
					butler.talking = engine.lastTime;
					this.startShakingHands(engine.lastTime);
				},
				onEnd: butler => {
					butler.talking = 0;
					this.startShakingHands(engine.lastTime);
				},
			},
			{
				message: "My name is Nicolas. Nicolas, Debossin.",
				voiceName: "Thomas",
				secondsAfterEnd: 2,
				onStart: butler => {
					butler.talking = engine.lastTime;
					this.startShakingHands(engine.lastTime);
				},
				onEnd: butler => {
					butler.talking = 0;
					this.startShakingHands(engine.lastTime);
				},
			},
			{
				topic: "shake_hands",
				message: `It is a great pleasure to have you, ${messire}. May I help you?`,
				voiceName: "Thomas",
				secondsAfterEnd: 2,
				onStart: butler => {
					butler.talking = engine.lastTime;
					this.startShakingHands(engine.lastTime);
				},
				onEnd: butler => {
					butler.talking = 0;
					this.startShakingHands(engine.lastTime);
				},
			},
			{
				topic: "pre_inquiry",
				responses: [
					{
						response: "I would like to enter the impossible room.",
						topic: "impossible-room",
						onSelect: () => {
							this.butler.shakingHands = 0;
							this.monkor.shakingHands = 0;
							this.updateHost(engine.lastTime);
						},
					},
					{
						response: "Tell me about your name.",
						topic: "name",
						onSelect: () => {
							this.butler.shakingHands = 0;
							this.monkor.shakingHands = 0;
							this.updateHost(engine.lastTime);
						},
					},
				],
			},
			{
				topic: "name",
				message: "With great pleasure. My name is Nicolas. Nicolas, Debossin.",
				voiceName: "Thomas",
				secondsAfterEnd: 2,
				onStart: butler => {
					butler.talking = engine.lastTime;
				},
				onEnd: butler => {
					butler.talking = 0;
				},
			},
			{
				message: "I am the son of Lucas and Isabella Debossin.",
				voiceName: "Thomas",
				secondsAfterEnd: 2,
				onStart: butler => {
					butler.talking = engine.lastTime;
				},
				onEnd: butler => {
					butler.talking = 0;
				},
			},
			{
				message: "I was named after my grand-mother. Her name is Nicole. But since I was born a boy, they chose the name Nicolas.",
				voiceName: "Thomas",
				secondsAfterEnd: 2,
				onStart: butler => {
					butler.talking = engine.lastTime;
				},
				onEnd: butler => {
					butler.talking = 0;
				},
				next: "pre_inquiry",
			},
			{
				topic: "impossible-room",
				message: `${Messire}, you know, it is impossible to escape from the impossible room?`,
				voiceName: "Thomas",
				secondsAfterEnd: 2,
				onStart: butler => {
					butler.talking = engine.lastTime;
				},
				onEnd: butler => {
					butler.talking = 0;
				},
			},
			{
				topic: "inquiry",
				responses: [
					{
						response: `${I}'d like to shake your hands`,
						topic: "shake_hands"
					},
					{
						response: "Why did you make a room that is impossible to escape?",
						topic: "why_impossible",
						condition: response => !response.discussed,
					},
					{
						response: `How do ${I} escape from the impossible room?`,
						topic: "how_to_escape",
						condition: response => !response.discussed,
					},
					{
						response: "There must be a way to escape.",
						topic: "how_to_escape",
						condition: response => !response.discussed,
					},
					{
						response: "Ok, take me to the impossible room",
						topic: "take_me_there",
					},
				],
			},
			{
				topic: "how_to_escape",
				message: "There is no way to escape, that is why it is called the impossible room.",
				voiceName: "Thomas",
				secondsAfterEnd: 2,
				onStart: butler => {
					butler.talking = engine.lastTime;
				},
				onEnd: butler => {
					butler.talking = 0;
				},
				next: "inquiry",
			},
			{
				topic: "why_impossible",
				message: "I did not make the impossible room. Nobody knows who made it. I am just your host.",
				voiceName: "Thomas",
				secondsAfterEnd: 2,
				onStart: butler => {
					butler.talking = engine.lastTime;
				},
				onEnd: butler => {
					butler.talking = 0;
				},
				next: "inquiry",
			},
			{
				topic: "take_me_there",
				message: `If you insist ${messire}, I will have no choice but to take you to the impossible room.`,
				voiceName: "Thomas",
				secondsAfterEnd: 2,
				onStart: butler => {
					butler.talking = engine.lastTime;
				},
				onEnd: butler => {
					butler.talking = 0;
				},
			},
			{
				message: `Please follow me, ${messire}.`,
				voiceName: "Thomas",
				secondsAfterEnd: 2,
				onStart: butler => {
					butler.talking = engine.lastTime;
				},
				onEnd: butler => {
					butler.talking = 0;
					butler.setProperty("nextRoomAvailable", engine.lastTime);

					butler.goal.x = 1000;
					butler.goal.y = 400;
					butler.onStill = () => {};
				},
				exit: true,
			},
			{
				topic: "unwanted-item",
				message: `No, thank you. ${Messire}.`,
				voiceName: "Thomas",
				secondsAfterEnd: 2,
				onStart: butler => {
					butler.talking = engine.lastTime;
				},
				onEnd: butler => {
					butler.talking = 0;
				},
				next: previousIndex => previousIndex,
			},
		]);		
	}

	startShakingHands(time) {
		this.butler.shakingHands = time;
		this.monkor.shakingHands = time;
		if (!this.butler.talking) {
			this.butler.changeAnimation(this.monkor.x < this.butler.x ? this.atlas.butler_shake_hands_left : this.atlas.butler_shake_hands_right, time, this.butler.shakingHands);
		} else {
			this.butler.changeAnimation(this.monkor.x < this.butler.x ? this.atlas.butler_shake_hands_talk_left : this.atlas.butler_shake_hands_talk_right, time, this.butler.shakingHands);					
		}
		//	Force time refresh
		this.monkor.changeAnimation(null, time, this.monkor.shakingHands);
		this.monkor.changeAnimation(this.monkor.x > this.butler.x ? this.atlas.monkor_shake_left : this.atlas.monkor_shake_right, time, this.monkor.shakingHands);

		if (this.monkor.properties.stinky_hand) {
			this.butler.setProperty("stinky_hand", true);
		}
	}

	updateHost(time) {
		const goalX = typeof(this.butler.goal.x) == "function" ? this.butler.goal.x(this.butler) : this.butler.goal.x;
		const goalY = typeof(this.butler.goal.y) == "function" ? this.butler.goal.y(this.butler) : this.butler.goal.y;
		const dx = goalX - this.butler.x;
		const dy = goalY - this.butler.y;
		const dist = Math.sqrt(dx * dx + dy * dy);
		if (dist > 5) {
			this.butler.changePosition(this.butler.x + dx / dist, this.butler.y + dy / dist, time);
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
				if (this.butler.talking) {
					this.butler.changeAnimation(this.monkor.x < this.butler.x ? this.atlas.butler_talk_left : this.atlas.butler_talk_right, time);
				} else {
					this.butler.changeAnimation(this.monkor.x < this.butler.x ? this.atlas.butler_still_left : this.atlas.butler_still_right, time);
				}
			}
			if (!this.butler.stillTime) {
				this.butler.stillTime = time;
			} else if (time - this.butler.stillTime > 1000) {
				if (this.butler.onStill) {
					const onStill = this.butler.onStill;
					this.butler.onStill = null;
					if (onStill(this.butler, time)) {
						this.butler.onStill = onStill;
					}
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
	}

	getWalkArea() {
		return this.backwall.getCollisionBox(engine.lastTime);		
	}

	refresh(time, dt) {
		super.refresh(time, dt);
		this.updateHost(time);
	}	

	nextLevelLeft() {
		this.engine.setGame(new Restroom());
	}

	nextLevelRight() {
		this.engine.setGame(new LockedRoom());
	}
}