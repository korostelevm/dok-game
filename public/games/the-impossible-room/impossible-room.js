class ImpossibleRoom extends GameCore {
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
			impossible_room_back: await engine.addTexture(
				{
					url: "assets/impossible-room.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .2,
					texture_blend: "source-atop",
					cols:3,rows:5,
					frameRate: 10,
					range:[0],
				}),
			impossible_room_door: await engine.addTexture(
				{
					url: "assets/impossible-room.png",
					collision_url: "assets/impossible-room.png",				
					texture_url: "assets/backwall.jpg",
					texture_alpha: .2,
					texture_blend: "source-atop",
					cols:3,rows:5,
					frameRate: 10,
					range:[1],
				}),
			impossible_room_door_opening: await engine.addTexture(
				{
					url: "assets/impossible-room.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .2,
					texture_blend: "source-atop",
					cols:3,rows:5,
					frameRate: 10,
					range:[1, 3],
				}),
			impossible_room_door_opened: await engine.addTexture(
				{
					url: "assets/impossible-room.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .2,
					texture_blend: "source-atop",
					cols:3,rows:5,
					frameRate: 10,
					range:[3],
				}),
			impossible_room_exit_light: await engine.addTexture(
				{
					url: "assets/impossible-room.png",
					collision_url: "assets/impossible-room.png",				
					texture_url: "assets/backwall.jpg",
					texture_alpha: .2,
					texture_blend: "source-atop",
					cols:3,rows:5,
					frameRate: 10,
					range:[4],
				}),
			impossible_room_exit_dark: await engine.addTexture(
				{
					url: "assets/impossible-room.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .2,
					texture_blend: "source-atop",
					cols:3,rows:5,
					frameRate: 10,
					range:[5],
				}),	
			choose_sign: await engine.addTexture(
				{
					url: "assets/impossible-room.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .2,
					texture_blend: "source-atop",
					cols:3,rows:5,
					frameRate: 10,
					range:[12],
				}),	
			monster_back_still: await engine.addTexture(
				{
					url: "assets/impossible-room.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .2,
					texture_blend: "source-atop",
					cols:3,rows:5,
					frameRate: 10,
					range:[6],
				}),
			monster_back: await engine.addTexture(
				{
					url: "assets/impossible-room.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .2,
					texture_blend: "source-atop",
					cols:3,rows:5,
					frameRate: 10,
					range:[6, 8],
				}),
			monster_back_done: await engine.addTexture(
				{
					url: "assets/impossible-room.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .2,
					texture_blend: "source-atop",
					cols:3,rows:5,
					frameRate: 10,
					range:[8],
				}),
			monster_front_still: await engine.addTexture(
				{
					url: "assets/impossible-room.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .2,
					texture_blend: "source-atop",
					cols:3,rows:5,
					frameRate: 10,
					range:[9],
				}),
			monster_front: await engine.addTexture(
				{
					url: "assets/impossible-room.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .2,
					texture_blend: "source-atop",
					cols:3,rows:5,
					frameRate: 10,
					range:[9, 11],
				}),
			monster_front_done: await engine.addTexture(
				{
					url: "assets/impossible-room.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .2,
					texture_blend: "source-atop",
					cols:3,rows:5,
					frameRate: 10,
					range:[11],
				}),
		};

		this.backwall = this.spriteFactory.create({
			anim: this.atlas.impossible_room_back,
			size: [800, 400],
		});
		this.spriteFactory.create({
			anim: this.atlas.choose_sign,
			size: [800, 400],
			x: 25,
		});

		this.left_exit = this.spriteFactory.create({
			name: "exit",
			anim: this.atlas.impossible_room_door,
			size: [800, 400],
			x: 100,
		}, {
			actions: [
				{
					name: "exit impossible room",
					action: exit => {
						this.exitImpossibleRoom();
					},
				},
			],
		});
		this.left_door = this.spriteFactory.create({
			name: "the left door",
			anim: this.atlas.impossible_room_door,
			size: [800, 400],
			x: 100,
		}, {
			reachable: true,
			actions: [
				{
					name: "choose left door",
					action: door => {
						this.data.doorChosen = "left";
						this.moveMonkor(this.monkor, [
								[400, null],
								[null, 265],
								[250, null],
							], monkor => {
								this.butler.goal.x = 550;
								this.monkor.alwaysLookup = true;
								this.butler.onStill = () => {
									if (this.properties.impossibleRoomSolved) {
										this.openFinalDoor(this.engine.lastTime);
									} else {
										this.confirmDoor();
									}
								};
							});
					},
				},
			],
			onFrame: {
				3: door => {
					door.changeAnimation(this.atlas.impossible_room_door_opened, this.engine.lastTime);
				},
			},
		});
		this.left_monster = this.spriteFactory.create({
			anim: this.atlas.monster_back_still,
			size: [800, 400],
			x: 100,
			opacity: 0,
		}, {
			onFrame: {
				8: monster => {
					monster.changeAnimation(this.atlas.monster_back_done, this.engine.lastTime);
				},
			},
		});

		this.right_exit = this.spriteFactory.create({
			name: "exit",
			anim: this.atlas.impossible_room_door,
			size: [800, 400],
			x: 400,
		}, {
			actions: [
				{
					name: "exit impossible room",
					action: exit => {
						this.exitImpossibleRoom();
					},
				},
			],
		});
		this.right_door = this.spriteFactory.create({
			name: "the right door",
			anim: this.atlas.impossible_room_door,
			size: [800, 400],
			x: 400,
		}, {
			reachable: true,
			actions: [
				{
					name: "choose right door",
					action: door => {
						this.data.doorChosen = "right";
						this.moveMonkor(this.monkor, [
								[400, null],
								[null, 265],
								[550, null],
							], monkor => {
								this.butler.goal.x = 250;
								this.monkor.alwaysLookup = true;
								this.butler.onStill = () => {
									this.confirmDoor();
								};
							});
					},
				},
			],
			onFrame: {
				3: door => {
					door.changeAnimation(this.atlas.impossible_room_door_opened, this.engine.lastTime);
				},
			},
		});
		this.right_monster = this.spriteFactory.create({
			anim: this.atlas.monster_back_still,
			size: [800, 400],
			x: 400,
			opacity: 0,
		}, {
			onFrame: {
				8: monster => {
					monster.changeAnimation(this.atlas.monster_back_done, this.engine.lastTime);
				},
			},
		});

		const Messire = gender === "T" ? "Messires" : gender === "W" ? "Madame" : "Messire";
		const messire = gender === "T" ? "messires" : gender === "W" ? "madame" : "messire";
		const me = gender === "T" ? "us" : "me";
		const my = gender === "T" ? "our" : "my";

		this.butler = this.spriteFactory.create({
			name: "Nicolas",
			anim: this.atlas.butler,
			x: 370, y: 255,
			size: [96,192],
			hotspot: [24,192],
		}, {
			bubbleTop: 30,
			reachable: true,
			actions: [
				{ name: "talk",
					action: butler => {
						this.startDialog(butler, [
							{
								responses: [
									{
										response: "Is this the impossible room?",
										topic: "impossible",
									},
									{
										response: `Can you give ${me} a hint?`,
										topic: "hint",
									},
									{
										response: `How do you predict which door ${I} will choose?`,
										topic: "how",
									},
									{
										response: `Ok, give ${me} some time to choose a door...`,
									},
								],
							},
							{
								message: `Go ahead, ${messire}.`,
								voiceName: "Thomas",
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => butler.talking = 0,
								exit: true,
							},
							{
								topic: "hint",
								message: `My hint will be irellevant, ${messire}.`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => butler.talking = 0,
							},
							{
								message: `You will choose the wrong door.`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => butler.talking = 0,
								exit: true,
							},
							{
								topic: "how",
								message: `My superior intellect allows me to predict your choice, ${messire}.`,
								voiceName: "Thomas",
								secondsAfterEnd: 2,
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => butler.talking = 0,
							},
							{
								message: `As such, I setup the door to ensure you open the wrong one.`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => butler.talking = 0,
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
								message: `Yes ${messire}.`,
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
								message: `At last, this is the impossible room, ${messire}.`,
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

		const I = gender === "T" ? "We" : "I";

		this.sceneData.monkor = this.sceneData.monkor || { x: -100, y: 390 };
	}

	confirmDoor() {
		this.monkor.alwaysLookup = false;
		const { gender } = this.data;
		const i = gender === "T" ? "we" : "I";
		const me = gender === "T" ? "us" : "me";
		const messire = gender === "T" ? "messires" : gender === "W" ? "madame" : "messire";
		this.startDialog(this.butler, [
			{
				message: `Are you sure, you want to open the ${this.data.doorChosen} door, ${messire}.`,
				voiceName: "Thomas",
				secondsAfterEnd: 1,
				onStart: butler => butler.talking = engine.lastTime,
				onEnd: butler => butler.talking = 0,
			},
			{
				responses: [
					{
						response: `Yes, ${i}'d like to open this door.`,
					},
					{
						topic: "change_mind",
						response: `No, ${i} choose the other door.`,
					},
				],
			},
			{
				exit: true,
				message: `Very well, go ahead, ${messire}.`,
				voiceName: "Thomas",
				secondsAfterEnd: 1,
				onStart: butler => {
					butler.talking = engine.lastTime;
				},
				onEnd: butler => {
					butler.talking = 0;
					this.monkor.setProperty("paused", true);
					this.monkor.alwaysLookup = true;
					setTimeout(() => {
						this.openFinalDoor(this.engine.lastTime);
					}, 3000);
				},
			},
			{
				topic: "change_mind",
				message: `Very well, ${messire}.`,
				voiceName: "Thomas",
				secondsAfterEnd: 1,
				onStart: butler => {
					butler.talking = engine.lastTime;
				},
				onEnd: butler => {
					butler.talking = 0;
					if (this.data.doorChosen === "left") {
						this.butler.goal.x = 250;
						this.data.doorChosen = "right";
						this.moveMonkor(this.monkor, [
							[550, null],
						], monkor => {
							this.monkor.alwaysLookup = true;
							this.butler.onStill = () => {
								this.confirmDoor();
							};
						});
					} else if (this.data.doorChosen === "right") {
						this.butler.goal.x = 550;
						this.data.doorChosen = "left";
						this.moveMonkor(this.monkor, [
							[250, null],
						], monkor => {
							this.monkor.alwaysLookup = true;
							this.butler.onStill = () => {
								this.confirmDoor();
							};
						});
					}
				},
			},
		]);		
	}

	openFinalDoor(time) {
		const wrongDoor = this?.swapData?.wrongDoor || this.data.doorChosen;
		this.data.wrongDoor = wrongDoor;
		const rightDoor = wrongDoor === "left" ? "right" : "left";
		this[`${wrongDoor}_exit`].changeAnimation(this.atlas.impossible_room_exit_dark, time);
		this[`${rightDoor}_exit`].changeAnimation(this.atlas.impossible_room_exit_light, time);

		this[`${this.data.doorChosen}_door`].changeAnimation(this.atlas.impossible_room_door_opening, time);
		this.audio.door.play();

		if (this.data.doorChosen === wrongDoor) {
			this[`${wrongDoor}_monster`].changeAnimation(this.atlas.monster_back_still, time);
			this[`${wrongDoor}_monster_front`].changeAnimation(this.atlas.monster_front_still, time);
			this[`${wrongDoor}_monster`].changeOpacity(1, time);
			this[`${wrongDoor}_monster_front`].changeOpacity(1, time);
			setTimeout(() => {
				this[`${wrongDoor}_monster`].changeAnimation(this.atlas.monster_back, this.engine.lastTime);
				this[`${wrongDoor}_monster_front`].changeAnimation(this.atlas.monster_front, this.engine.lastTime);
				this.audio.scream.play();
				setTimeout(() => {
					this.monkor.changeOpacity(0, this.engine.lastTime);
					this[`${wrongDoor}_monster`].changeOpacity(0, this.engine.lastTime);
					this[`${wrongDoor}_monster_front`].changeOpacity(0, this.engine.lastTime);
					this[`${wrongDoor}_door`].changeAnimation(this.atlas.impossible_room_door, this.engine.lastTime);
					this.audio.eat.play();
					setTimeout(() => this.gameOver(), 5000);
				}, 2000);
			}, 1500);
		} else {
			setTimeout(() => {
				this.butler.surprised = true;
				setTimeout(() => {
					this.butler.talking = engine.lastTime;
					this.showBubble(`Wait ... you opened the correct door?`, () => {
						this.butler.talking = 0;
						setTimeout(() => {
							this.butler.talking = engine.lastTime;
							this.showBubble(`C'EST IMPOSSIBLE!!!`, () => {
								this.butler.talking = 0;
								setTimeout(() => {
									this.butler.talking = engine.lastTime;
									this.showBubble(`C'EST IMPOSSIBLE!!!`, () => {
										this[`${wrongDoor}_door`].changeAnimation(this.atlas.impossible_room_door_opening, this.engine.lastTime);
										this.audio.door.play();

										this.butler.talking = 0;

										this[`${wrongDoor}_monster`].changeOpacity(1, time);
										this[`${wrongDoor}_monster_front`].changeOpacity(1, time);
										setTimeout(() => {
											this[`${wrongDoor}_monster`].changeAnimation(this.atlas.monster_back, this.engine.lastTime);
											this[`${wrongDoor}_monster_front`].changeAnimation(this.atlas.monster_front, this.engine.lastTime);
											this.audio.scream.play();
											setTimeout(() => {
												this.butler.changeOpacity(0, this.engine.lastTime);
												this[`${wrongDoor}_monster`].changeOpacity(0, this.engine.lastTime);
												this[`${wrongDoor}_monster_front`].changeOpacity(0, this.engine.lastTime);
												this[`${wrongDoor}_door`].changeAnimation(this.atlas.impossible_room_door, this.engine.lastTime);
												this.audio.eat.play();


												this.monkor.lookLeft = "left" === wrongDoor;
												this.monkor.lookRight = "right" === wrongDoor;
												this.monkor.alwaysLookup = false;

												setTimeout(() => {
													this.monkor.lookLeft = false;
													this.monkor.lookRight = false;
													this.monkor.alwaysLookup = false;
													setTimeout(() => {
														this.showBubble(`Where did Nicolas Debossin go?`, () => {
															this.monkor.setProperty("paused", false);
															this.setProperty("impossibleRoomSolved", new Date().getTime());
														});			
													}, 500);
												}, 3000);
											}, 2000);
										}, 1500);

									}, "Thomas", this.butler);
								}, 300);
							}, "Thomas", this.butler);
						}, 1500);
					}, "Thomas", this.butler);
				}, 1000);
			}, 500);
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
				const dxToMonkor = this.butler.x - this.monkor.x;
				const dyToMonkor = this.butler.y - this.monkor.y;
				const distToMonkor = Math.sqrt(dxToMonkor * dxToMonkor + dyToMonkor * dyToMonkor);
				if (this.butler.talking) {
					if (this.butler.surprised) {
						this.butler.changeAnimation(this.monkor.x < this.butler.x ? this.atlas.butler_surprised_left_talk : this.atlas.butler_surprised_right_talk, time);
					} else {
						this.butler.changeAnimation(this.monkor.x < this.butler.x ? this.atlas.butler_talk_left : this.atlas.butler_talk_right, time);
					}
				} else if (this.butler.surprised) {
					this.butler.changeAnimation(this.monkor.x < this.butler.x ? this.atlas.butler_surprised_left_still : this.atlas.butler_surprised_right_still, time);
				} else if (this.dialog) {
					this.butler.changeAnimation(this.monkor.x < this.butler.x ? this.atlas.butler_still_left : this.atlas.butler_still_right, time);
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
		this.monkor.bubbleTop = 50;

		this.left_monster_front = this.spriteFactory.create({
			anim: this.atlas.monster_front_still,
			size: [800, 400],
			x: 100,
			opacity: 0,
		}, {
			onFrame: {
				11: monster => {
					monster.changeAnimation(this.atlas.monster_front_done, this.engine.lastTime);
				},
			},
		});

		this.right_monster_front = this.spriteFactory.create({
			anim: this.atlas.monster_front_still,
			size: [800, 400],
			x: 400,
			opacity: 0,
		}, {
			onFrame: {
				11: monster => {
					monster.changeAnimation(this.atlas.monster_front_done, this.engine.lastTime);
				},
			},
		});


		const { gender } = this.data;
		const I = gender === "T" ? "We" : "I";
		const i = gender === "T" ? "we" : "I";
		const Messire = gender === "T" ? "Messires" : gender === "W" ? "Madame" : "Messire";
		const messire = gender === "T" ? "messires" : gender === "W" ? "madame" : "messire";
		const me = gender === "T" ? "us" : "me";
		const my = gender === "T" ? "our" : "my";

		this.monkor.busy = true;
		if (this.isFirstTime()) {
			this.monkor.goal.x = 100;
			// this.monkor.setProperty("paused", true);

			this.monkor.onStill = () => {
				// return;////////	

				this.startDialog(this.butler, [
					{
						message: `Hello ${messire}.`,
						voiceName: "Thomas",
						secondsAfterEnd: 1,
						onStart: butler => butler.talking = engine.lastTime,
						onEnd: butler => butler.talking = 0,
					},
					{
						message: `At last, you have reached the impossible room.`,
						voiceName: "Thomas",
						secondsAfterEnd: 1,
						onStart: butler => butler.talking = engine.lastTime,
						onEnd: butler => butler.talking = 0,
					},
					{
						message: `I have an important secret to reveal.`,
						voiceName: "Thomas",
						secondsAfterEnd: 1,
						onStart: butler => butler.talking = engine.lastTime,
						onEnd: butler => butler.talking = 0,
					},
					{
						message: `I am, in fact, the creator of the Impossible Room.`,
						voiceName: "Thomas",
						secondsAfterEnd: 1,
						onStart: butler => butler.talking = engine.lastTime,
						onEnd: butler => butler.talking = 0,
					},
					{
						responses: [
							{
								condition: () => this?.swapData?.doorChosen || localStorage.getItem("cut_to_the_chase"),
								response: `Let's just cut to the chase, ${i}'ll pick a door`,
								topic: "cut_to_the_chase",
							},
							{
								condition: () => !this?.swapData?.doorChosen,
								response: `How amazing!`,
								topic: "continue",
							},
							{
								condition: () => !this?.swapData?.doorChosen,
								response: `How surprising!`,
								topic: "continue",
							},
							{
								condition: () => !this?.swapData?.doorChosen,
								response: `How interesting!`,
								topic: "continue",
							},
						],
					},
					{
						topic: "continue",
						message: `Indeed. And this is the end of the road for you, ${messire}.`,
						voiceName: "Thomas",
						secondsAfterEnd: 1,
						onStart: butler => butler.talking = engine.lastTime,
						onEnd: butler => butler.talking = 0,
					},
					{
						message: `Since this room, is impossible to solve.`,
						voiceName: "Thomas",
						secondsAfterEnd: 1,
						onStart: butler => butler.talking = engine.lastTime,
						onEnd: butler => butler.talking = 0,
					},
					{
						responses: [
							{
								response: `How is this room impossible?`,
							},
							{
								response: `So, what do ${i} do in this room?`,
							},
						],
					},
					{
						message: `I will get to it, ${messire}.`,
						voiceName: "Thomas",
						secondsAfterEnd: 1,
						onStart: butler => butler.talking = engine.lastTime,
						onEnd: butler => butler.talking = 0,
					},
					{
						message: `Do you know the theory of determinism, ${messire}?`,
						voiceName: "Thomas",
						secondsAfterEnd: 1,
						onStart: butler => butler.talking = engine.lastTime,
						onEnd: butler => butler.talking = 0,
					},
					{
						responses: [
							{
								response: `Yes, it's the theory that everything is determined, ${I} have no free will.`,
							},
							{
								response: `Yes, it's the theory that God decides everything.`,
							},
							{
								response: `Yes, it's the theory that we are all decendants of a fish with legs.`,
							},
							{
								response: `Yes, it's the theory that a cat can be both dead and alive inside a box.`,
							},
						],
					},
					{
						message: `I don't think you understand the implications of determinism, ${messire}.`,
						voiceName: "Thomas",
						secondsAfterEnd: 1,
						onStart: butler => butler.talking = engine.lastTime,
						onEnd: butler => butler.talking = 0,
					},
					{
						message: `It states that an all knowing being can predict the future.`,
						voiceName: "Thomas",
						secondsAfterEnd: 1,
						onStart: butler => butler.talking = engine.lastTime,
						onEnd: butler => butler.talking = 0,
					},
					{
						message: `I have, indeed, reached such level of intellect.`,
						voiceName: "Thomas",
						secondsAfterEnd: 1,
						onStart: butler => butler.talking = engine.lastTime,
						onEnd: butler => butler.talking = 0,
					},
					{
						message: `In front of you ${messire}, are two doors.`,
						voiceName: "Thomas",
						secondsAfterEnd: 1,
						onStart: butler => butler.talking = engine.lastTime,
						onEnd: butler => butler.talking = 0,
					},
					{
						message: `One leads to the exit of the impossible room,`,
						voiceName: "Thomas",
						secondsAfterEnd: 1,
						onStart: butler => butler.talking = engine.lastTime,
						onEnd: butler => butler.talking = 0,
					},
					{
						message: `and the other one leads to certain death.`,
						voiceName: "Thomas",
						secondsAfterEnd: 1,
						onStart: butler => butler.talking = engine.lastTime,
						onEnd: butler => butler.talking = 0,
					},
					{
						message: `As an all knowing being, I know which door you are going to choose.`,
						voiceName: "Thomas",
						secondsAfterEnd: 1,
						onStart: butler => butler.talking = engine.lastTime,
						onEnd: butler => butler.talking = 0,
					},
					{
						message: `therefore, I setup that door to lead to certain death.`,
						voiceName: "Thomas",
						secondsAfterEnd: 1,
						onStart: butler => butler.talking = engine.lastTime,
						onEnd: butler => butler.talking = 0,
					},
					{
						message: `That is why, ${messire}, this room is, for you, impossible.`,
						voiceName: "Thomas",
						secondsAfterEnd: 1,
						onStart: butler => butler.talking = engine.lastTime,
						onEnd: butler => butler.talking = 0,
					},
					{
						responses: [
							{
								response: `So I can just choose any door?`,
							},
						],
					},
					{
						message: `Yes, ${messire}.`,
						voiceName: "Thomas",
						secondsAfterEnd: 1,
						onStart: butler => butler.talking = engine.lastTime,
						onEnd: butler => {
							butler.talking = 0;
							localStorage.setItem("cut_to_the_chase", true);
						},
						exit: true,
					},
					{
						topic: "cut_to_the_chase",
						message: `Ok, ${messire}, just go ahead.`,
						voiceName: "Thomas",
						secondsAfterEnd: 1,
						onStart: butler => butler.talking = engine.lastTime,
						onEnd: butler => butler.talking = 0,						
						exit: true,
					},
				]);
			};
		} else {
			this.monkor.goal.x = this.monkor.x;
			this.monkor.goal.y = this.monkor.y;
		}
		this.putBackJoker();
	}

	exitImpossibleRoom() {
		this.monkor.goingup = this.engine.lastTime;
	}

	getWalkArea() {
		return {};//this.backwall.getCollisionBox(engine.lastTime);		
	}

	refresh(time, dt) {
		super.refresh(time, dt);
		this.updateHost(time);
	}	

	upperLevel() {
		getMedal("The Impossible Room", this.onUnlockMedal);
		this.engine.setGame(new Mall());
	}

	openLeft() {

	}

	openRight() {
		
	}

	nextLevelLeft() {
	}

	nextLevelRight() {
	}
}