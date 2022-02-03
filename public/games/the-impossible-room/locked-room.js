class LockedRoom extends RoomBase {
	async init(engine, coreName) {
		await super.init(engine, coreName);


		const { gl, config } = engine;
		const { gender } = this.data;

		/* Load Audio */
		this.audio = {
			...this.audio,
		};

		this.atlas = {
			...this.atlas,
			left_door_lock: await engine.addTexture(
				{
					url: "assets/lobby.png",
					collision_url: "assets/lobby.png",
					collision_padding: 10,
					cols:4,rows:7,
					range:[24],
				}),
			left_door_lock_stuck: await engine.addTexture(
				{
					url: "assets/lobby.png",
					collision_url: "assets/lobby.png",
					cols:4,rows:7,
					range:[25],
				}),
			right_door_lock: await engine.addTexture(
				{
					url: "assets/lobby.png",
					collision_url: "assets/lobby.png",
					collision_padding: 10,
					cols:4,rows:7,
					range:[24],
				}),
			right_door_lock_stuck: await engine.addTexture(
				{
					url: "assets/lobby.png",
					collision_url: "assets/lobby.png",
					cols:4,rows:7,
					range:[25],
				}),
			butler_stinky: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [26,27],
					frameRate: 10,
					hotspot: [.25, 1],
				}),
			butler_smell_left: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [28,29],
					frameRate: 10,
				}),
			butler_smell_right: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [30,31],
					frameRate: 10,
					hotspot: [.25, 1],
				}),
			butler_smell_right_arm: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [32,33],
					frameRate: 10,
					hotspot: [.25, 1],
				}),
			butler_smell_left_arm: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [34,35],
					frameRate: 10,
					hotspot: [.25, 1],
				}),
			butler_foul: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [36],
					hotspot: [.25, 1],
				}),
		};

		const I = gender === "T" ? "We" : "I";


		this.backwall = this.spriteFactory.create({
			anim: this.atlas.backwall,
			size: [800, 400],
		});
		this.spriteFactory.create({
			anim: this.atlas.side_doors,
			size: [800, 400],
		});
		this.doorBackOpened = this.spriteFactory.create({
			name: "Backdoor",
			anim: this.atlas.left_door_opened,
			size: [800, 400],
			opacity: 0,
		}, {
		});
		this.doorBack = this.spriteFactory.create({
			name: "Exit",
			anim: this.atlas.left_door,
			size: [800, 400],
		}, {
		});
		this.doorBackLock = this.spriteFactory.create({
			name: "keyhole",
			anim: this.atlas.left_door_lock,
			size: [800, 400],
		}, {
			actions: [
				{ name: "look", message: keyhole => keyhole.properties.stuck ? `${I} covered the keyhole with a gum.` : `${I} can see the lobby through this keyhole.`,
				},
				{ name: "unlock", condition: entrance => this.selectedItem === "key",
					item: ["key", "key_turd"],
					message: keyhole => keyhole.properties.stuck ?`The keyhole is stuck.` : `That key does not fit.`,
				},
				{ name: "block", condition: () => !this.butler.gone, condition: entrance => this.selectedItem === "gum",
					item: ["gum"],
					message: keyhole => ``,
					command: (item, target) => `stick ${item.name} into the ${target.name}.`,
					action: lock => {
						if (this.butler_gone) {
							this.removeFromInventory("gum");
							this.audio.pickup.play();
							lock.setProperty("stuck", engine.lastTime);
						} else {
							this.monkor.setProperty("paused", engine.lastTime);
							this.monkor.goal.x = 200;
							this.butler.talking = engine.lastTime;
							this.showBubble(`I'm sorry ${messire}, but you must escape through the other door.`, () => {
								this.butler.talking = 0;
								setTimeout(() => {
								this.monkor.goal.x = 300;
									this.monkor.onStill = () => {
										this.showBubble(`There should be a way to keep him busy...`, () => {
											this.monkor.setProperty("paused", null);
										});
									};
								}, 2000);
							}, "Thomas", this.butler);
						}
					},
				},
			],
			onChange: {
				stuck: (keyhole, stuck) => {
					keyhole.changeAnimation(stuck ? this.atlas.left_door_lock_stuck : this.atlas.left_door_lock, engine.lastTime);
				},
			},
		});

		this.doorForwardClosed = this.spriteFactory.create({
			anim: this.atlas.right_door,
			size: [800, 400],
		});
		this.doorNextLock = this.spriteFactory.create({
			name: "keyhole",
			anim: this.atlas.right_door_lock,
			size: [800, 400],
			x: 690,
		}, {
			actions: [
				{ name: "look", message: keyhole => keyhole.properties.stuck ? `${I} covered the keyhole with a gum.` : `${I} can see the next room through this keyhole.`,
				},
				{ name: "unlock", condition: entrance => this.selectedItem === "key" || this.selectedItem === "key_turd",
					item: ["key", "key_turd"],
					message: keyhole => keyhole.properties.stuck ?`The keyhole is stuck.` : `That key does not fit.`,
				},
				{ name: "block", condition: entrance => this.selectedItem === "gum",
					item: ["gum"],
					message: `${I} don't want to block the door to the next room. How will I escape?`,
				},
			],
			onChange: {
				stuck: (keyhole, stuck) => {
					keyhole.changeAnimation(stuck ? this.atlas.right_door_lock_stuck : this.atlas.left_door_lock, engine.lastTime);
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
				{ name: "walk through",
					action: forward_door => {
						this.monkor.setProperty("paused", engine.lastTime);
						this.monkor.goal.x = 900;
					},
				},
			],
		});


		const Messire = gender === "T" ? "Messires" : gender === "W" ? "Madame" : "Messire";
		const messire = gender === "T" ? "messires" : gender === "W" ? "madame" : "messire";

		this.butler = this.spriteFactory.create({
			name: "Nicolas",
			anim: this.atlas.butler,
			x: 80, y: 340,
			size: [96,192],
			speed: 10,
		}, {
			actions: [
				{ name: "talk", condition: () => !this.butler_gone,
					action: butler => {
						this.monkor.goal.x = this.butler.x + 100;
						if (this.butler.properties.stinky_hand) {
							if (this.butler.smelling_step > 5) {
	 							this.butler.smelling_step = 5;
							}
							this.butler.talking = engine.lastTime;
							this.monkor.lookLeft = engine.lastTime;
							this.showBubble(`Sorry, ${messire}. Could you please hold on a second?`, () => {
								this.butler.talking = 0;
								this.monkor.lookLeft = 0;
								//
							}, "Thomas", this.butler);
						} else {
							const voiceName = "Thomas";

							this.startDialog(butler, [
								{
									topic: "intro",
									message: `Yes, ${messire}?`,
									voiceName: "Thomas",
									onStart: butler => butler.talking = engine.lastTime,
									onEnd: butler => butler.talking = 0,
								},
								{
									topic: "question",
									responses: [
										{
											response: "Is this the impossible room?",
											topic: "impossible",
										},
										{
											response: "How can I exit this room?",
											topic: "how_exit",
										},
										{
											response: `${I}'d like to shake your hands`,
											topic: "shake_hands",
											condition: () => this.monkor.properties.stinky_hand,
										},
										{
											response: `${I} need to go to the restroom.`,
											topic: "restroom",
											condition: () => !this.monkor.properties.stinky_hand,
										},
										{
											response: "I'll be on my way.",
											topic: "exit",
										},
									],
								},
								{
									topic: "exit",
									message: `Au revoir, ${messire}.`,
									voiceName: "Thomas",
									onStart: butler => butler.talking = engine.lastTime,
									onEnd: butler => {
										setTimeout(() => {
											butler.talking = 0;
										}, 1000);
									},
									exit: true,
								},
								{
									topic: "unwanted-item",
									message: `No thank you, ${messire}.`,
									voiceName,
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
									message: `This is only the first room, and already it's impossible to exit, ${messire}.`,
									voiceName: "Thomas",
									secondsAfterEnd: 1,
									onStart: butler => {
										butler.talking = engine.lastTime;
									},
									onEnd: butler => {
										butler.talking = 0;
									},
									next: "question",
								},
								{
									topic: "how_exit",
									message: `There is now way to exit, ${messire}. The room is locked.`,
									voiceName: "Thomas",
									secondsAfterEnd: 1,
									onStart: butler => {
										butler.talking = engine.lastTime;
									},
									onEnd: butler => {
										butler.talking = 0;
									},
									next: "locked",
								},
								{
									topic: "locked",
									responses: [
										{
											response: "Where is the key to the next room?",
											topic: "key",
										},
										{
											response: "Can you unlock the door for me?",
											topic: "unlock",
										},
										{
											response: "Why can't you unlock the door for me?",
											topic: "why",
										},									
										{
											response: "I'll be on my way",
											topic: "exit",
										},
									],
								},
								{
									topic: "key",
									message: `I do have it, ${messire}.`,
									voiceName: "Thomas",
									secondsAfterEnd: 1,
									onStart: butler => {
										butler.talking = engine.lastTime;
									},
									onEnd: butler => {
										butler.talking = 0;
									},
									next: "locked",
								},
								{
									topic: "unlock",
									message: `Unfortunately, it is impossible, ${messire}.`,
									voiceName: "Thomas",
									secondsAfterEnd: 1,
									onStart: butler => {
										butler.talking = engine.lastTime;
									},
									onEnd: butler => {
										butler.talking = 0;
									},
									next: "locked",
								},
								{
									topic: "why",
									message: `It would defeat the purpose of the room, ${messire}.`,
									voiceName: "Thomas",
									secondsAfterEnd: 1,
									onStart: butler => {
										butler.talking = engine.lastTime;
									},
									onEnd: butler => {
										butler.talking = 0;
									},
									next: "locked",
								},
								{
									topic: "restroom",
									message: `I cannot let you out, ${messire}.`,
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
									message: `Can you please hold it? ${Messire}?`,
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
									responses: [
										{
											response: `${I} really can't. It's about to come out!`,
										},
										{
											response: `${I} better not. It's a number 2.`,
										},
										{
											response: `You would not want to rename this the stinky room, would you?`,
										},
									],
								},
								{
									message: `Ok ${Messire}, I will let you out, just this one time.`,
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
									message: `Please follow me, ${Messire}.`,
									voiceName: "Thomas",
									secondsAfterEnd: 1,
									onStart: butler => {
										butler.talking = engine.lastTime;
									},
									onEnd: butler => {
										butler.talking = 0;
										this.exitButler();
									},
									exit: true,					
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
										this.monkor.lookLeft = 0;
										this.startShakingHands(0);
									},
								},
								{
									topic: "after_shake_hands",
									responses: [
										{
											response: "May I ask you something?",
											topic: "intro",
										},
										{
											response: "Ok, I'll try to find a way to escape. Sounds like fun!",
											topic: "exit",
										},
									],
								},
							]);

						}
					},
				},
			],
		}, butler => {
			butler.goal = {x: butler.x, y: butler.y};
		});
		this.sceneData.monkor = this.sceneData.monkor || { x: 120, y: 350 };
		this.sceneStarted = engine.lastTime;
	}

	openLeft() {
		this.doorBackOpened.changeOpacity(1, engine.lastTime);										
		this.doorBack.changeOpacity(0, engine.lastTime);
		this.doorBackLock.changeOpacity(0, engine.lastTime);
	}


	startShakingHands(time) {
		this.butler.shakingHands = time;
		this.monkor.shakingHands = time;
		this.monkor.lookLeft = time;
		if (!this.butler.talking) {
			this.butler.changeAnimation(this.monkor.x < this.butler.x ? this.atlas.butler_shake_hands_left : this.atlas.butler_shake_hands_right, time, this.butler.shakingHands);
		} else {
			this.butler.changeAnimation(this.monkor.x < this.butler.x ? this.atlas.butler_shake_hands_talk_left : this.atlas.butler_shake_hands_talk_right, time, this.butler.shakingHands);					
		}
		//	Force time refresh
		this.monkor.changeAnimation(null, time, this.monkor.shakingHands);
		this.monkor.changeAnimation(this.atlas.monkor_shake_left, time, this.monkor.shakingHands);

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
		const speed = Math.min(dist, this.butler.speed || 1);
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
					if (this.butler.angry) {
						this.butler.changeAnimation(this.monkor.x < this.butler.x || this.butler.lookLeft ? this.atlas.butler_talk_angry_left : this.atlas.butler_talk_angry_right, time);
					} else {
						this.butler.changeAnimation(this.monkor.x < this.butler.x || this.butler.lookLeft ? this.atlas.butler_talk_left : this.atlas.butler_talk_right, time);						
					}
				} else if (this.dialog) {
					if (this.butler.angry) {
						this.butler.changeAnimation(this.monkor.x < this.butler.x || this.butler.lookLeft ? this.atlas.butler_angry_left : this.atlas.butler_angry_right, time);
					} else {
						this.butler.changeAnimation(this.monkor.x < this.butler.x || this.butler.lookLeft ? this.atlas.butler_still_left : this.atlas.butler_still_right, time);						
					}
				} else if (this.butler.smelling) {
					switch(this.butler.smelling_step) {
						case 0:
						case 1:
						case 2:
							this.butler.changeAnimation(this.atlas.butler_stinky, time);
							break;
						case 3:
						case 4:
							this.butler.changeAnimation(this.atlas.butler_smell_left, time);
							break;
						case 5:
						case 6:
							this.butler.changeAnimation(this.atlas.butler_smell_right, time);
							break;
						case 7:
						case 8:
							this.butler.changeAnimation(this.atlas.butler_stinky, time);
							break;
						case 9:
							this.butler.changeAnimation(this.atlas.butler_smell_right, time);
							break;
						case 10:
						case 11:
							this.butler.changeAnimation(this.atlas.butler_smell_right_arm, time);
							break;
						case 12:
							this.butler.changeAnimation(this.atlas.butler_stinky, time);
							break;
						case 13:
						case 14:
							this.butler.changeAnimation(this.atlas.butler_smell_left_arm, time);
							break;
						case 15:
						case 16:
						case 17:
							this.butler.changeAnimation(this.atlas.butler_foul, time);
							break;
						default:
							this.butler.smelling = 0;
							this.returnButler();
					}
					if (time - this.butler.smelling > 1000) {
						this.butler.smelling_step++;
						this.butler.smelling = time;
					}
				} else if (this.butler.properties.stinky_hand && time - Math.max(this.butler.properties.stinky_hand, this.sceneStarted) > 8000) {
					this.butler.changeAnimation(this.atlas.butler_stinky, time);
					if (time - this.sceneStarted > 12000) {
						this.butler.smelling = time;
						this.butler.smelling_step = 0;
					}
				} else if (this.butler.lookLeft) {
					this.butler.changeAnimation(this.butler.angry ? this.atlas.butler_angry_left : this.atlas.butler_still_left, time);
				} else if (this.butler.lookRight) {
					this.butler.changeAnimation(this.butler.angry ? this.atlas.butler_angry_right : this.atlas.butler_still_right, time);
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

	setDoorOpened(opened) {
		this.monkor.setProperty("paused", opened ? engine.lastTime : null);
		this.doorBackOpened.changeOpacity(opened?1:0, engine.lastTime);										
		this.doorBack.changeOpacity(opened?0:1, engine.lastTime);
		this.doorBackLock.changeOpacity(opened?0:1, engine.lastTime);
	}

	setNextDoorOpened(opened) {
		this.doorForwardOpened.changeOpacity(opened?1:0, engine.lastTime);										
		this.doorForwardClosed.changeOpacity(opened?0:1, engine.lastTime);
		if (this.doorNextLock) {
			this.doorNextLock.changeOpacity(opened?0:1, engine.lastTime);
		}
	}

	blockedButler() {
		const { gender } = this.data;
		const I = gender === "T" ? "We" : "I";
		const me = gender === "T" ? "us" : "me";
		const am = gender === "T" ? "are" : "am";
		const Messire = gender === "T" ? "Messires" : gender === "W" ? "Madame" : "Messire";
		const messire = gender === "T" ? "messires" : gender === "W" ? "madame" : "messire";

		this.butler.lookLeft = engine.lastTime;
		setTimeout(() => {
			this.butler.angry = true;
		}, 3000);
		setTimeout(() => {
			this.butler.talking = engine.lastTime;
			this.showBubble(`What is this?`, () => {
				this.butler.talking = 0;
			}, "Thomas", this.butler);
		}, 4000);
		setTimeout(() => {
			this.monkor.lookLeft = false;
			this.butler.lookLeft = 0;
			this.startDialog(this.butler, [
				{
					topic: "intro",
					message: `${Messire}, the keyhole is stuck.`,
					voiceName: "Thomas",
					secondsAfterEnd: 2,
					onStart: butler => butler.talking = engine.lastTime,
					onEnd: butler => butler.talking = 0,
				},
				{
					message: `Tell me ${messire}, are you responsible for this prank?`,
					voiceName: "Thomas",
					secondsAfterEnd: 2,
					onStart: butler => butler.talking = engine.lastTime,
					onEnd: butler => butler.talking = 0,
				},
				{
					responses: [
						{
							response: `It wasn't ${me}, ${I} swear.`,
						},
						{
							response: `${I} saw a kid doing this, and he escaped through the other door.`,
						},
						{
							response: `The keyhole was always like this. ${I} ${am} not lying to you.`,
						},
					],
				},
				{
					message: `Is that so?`,
					voiceName: "Thomas",
					secondsAfterEnd: 2,
					onStart: butler => butler.talking = engine.lastTime,
					onEnd: butler => {
						butler.talking = 0;
					},
				},
				{
					responses: [
						{
							response: `You don't suppose we have a way out, do you?`,
						},
						{
							response: `Can't we just exit the other door then?`,
						},
					],
				},
				{
					message: `${Messire}, the door to the lobby locks after closing.`,
					voiceName: "Thomas",
					secondsAfterEnd: 2,
					onStart: butler => butler.talking = engine.lastTime,
					onEnd: butler => {
						butler.talking = 0;
					},
				},
				{
					message: `But I can no longer unlock it.`,
					voiceName: "Thomas",
					secondsAfterEnd: 2,
					onStart: butler => butler.talking = engine.lastTime,
					onEnd: butler => {
						butler.talking = 0;
					},
				},
				{
					message: `And I cannot just let you out the other way.`,
					voiceName: "Thomas",
					secondsAfterEnd: 2,
					onStart: butler => butler.talking = engine.lastTime,
					onEnd: butler => {
						butler.talking = 0;
					},
				},
				{
					message: `That would defeat the purpose of the game.`,
					voiceName: "Thomas",
					secondsAfterEnd: 2,
					onStart: butler => butler.talking = engine.lastTime,
					onEnd: butler => {
						butler.talking = 0;
					},
				},
				{
					message: `Therefore, we are stuck in this room forever!`,
					voiceName: "Thomas",
					secondsAfterEnd: 2,
					onStart: butler => butler.talking = engine.lastTime,
					onEnd: butler => {
						butler.talking = 0;
					},
				},
				{
					topic: "let_me_out",
					responses: [
						{
							response: `Can you open the other door? Pretty please?`,
						},
						{
							response: `Oh come on, we can bend the rules once in a while...`,
						},
						{
							response: `Are you telling ${me} you'd rather be stuck in this room with ${me} rather than letting ${me} escape?`,
						},
						{
							response: `Hey guess what? ${I} really need to go to the restroom. This time, it's really urgent...`,
							topic: "restroom",
						},
					],
				},
				{
					message: `I'm sorry ${messire}, but I cannot break the policy of the impossible room.`,
					voiceName: "Thomas",
					secondsAfterEnd: 2,
					onStart: butler => butler.talking = engine.lastTime,
					onEnd: butler => {
						butler.talking = 0;
					},
					next: "let_me_out",
				},
				{
					topic: "restroom",
					message: `D'accord, d'accord! Bordel de merde!`,
					voiceName: "Thomas",
					secondsAfterEnd: 1,
					onStart: butler => butler.talking = engine.lastTime,
					onEnd: butler => {
						butler.talking = 0;
					},
				},
				{
					message: `I will open the other door.`,
					voiceName: "Thomas",
					secondsAfterEnd: 1,
					onStart: butler => butler.talking = engine.lastTime,
					onEnd: butler => {
						butler.talking = 0;
					},
				},
				{
					message: `But I warn you, we're not out yet.`,
					voiceName: "Thomas",
					secondsAfterEnd: 1,
					onStart: butler => butler.talking = engine.lastTime,
					onEnd: butler => {
						butler.talking = 0;
					},
				},
				{
					message: `That door only takes us to the next room!`,
					voiceName: "Thomas",
					secondsAfterEnd: 1,
					onStart: butler => butler.talking = engine.lastTime,
					onEnd: butler => {
						butler.talking = 0;
					},
				},
				{
					message: `For which, I do not have the key.`,
					voiceName: "Thomas",
					secondsAfterEnd: 1,
					onStart: butler => butler.talking = engine.lastTime,
					onEnd: butler => {
						butler.talking = 0;
					},
				},
				{
					message: `Follow me, ${messire}.`,
					voiceName: "Thomas",
					secondsAfterEnd: 1,
					onStart: butler => butler.talking = engine.lastTime,
					onEnd: butler => {
						butler.smelling = 0;
						butler.setProperty("stinky_hand", null);
						butler.talking = 0;
						butler.goal.x = 680;
						butler.goal.y = 360;
						butler.onStill = () => {
							setTimeout(() => {
								this.setNextDoorOpened(true);
								setTimeout(() => {
									this.butler.goal.x = 800;
								}, 1000);
							}, 1000);
						};
					},
					exit: true,
				},
			]);
		}, 7000);
	}

	exitButler() {
		if (this.doorBackLock.properties.stuck) {
			this.blockedButler();
			return;
		}
		const { gender } = this.data;
		const Messire = gender === "T" ? "Messires" : gender === "W" ? "Madame" : "Messire";
		const messire = gender === "T" ? "messires" : gender === "W" ? "madame" : "messire";
		this.butler.goal.x = -80;
		this.butler.goal.y = 360;
		this.butler.setProperty("stinky_hand", null);
		this.butler.smelling = 0;
		this.butler_gone = engine.lastTime;
		this.setDoorOpened(true);
		this.monkor.setProperty("paused", engine.lastTime);
		this.monkor.goal.x = -100;

	}	

	exitButlerToRestroom() {
		if (this.doorBackLock.properties.stuck) {
			this.blockedButler();
			return;
		}
		this.butler.goal.x = -80;
		this.butler.goal.y = 360;
		this.butler.talking = 0;
		this.monkor.lookLeft = 0;
		this.butler.setProperty("stinky_hand", null);
		this.butler.smelling = 0;
		this.butler_gone = engine.lastTime;		
		this.setDoorOpened(true);
		setTimeout(() => {
			this.setDoorOpened(false);
		}, 2000);

		setTimeout(() => {
			this.butler.goal.x = 80;
			this.butler.goal.y = 340;
			delete this.butler_gone;
			this.setDoorOpened(true);
			if (this.monkor.x < 200) {
				this.monkor.goal.x = 200;
			}
			setTimeout(() => {
				this.butler.talking = engine.lastTime;
				this.monkor.lookLeft = engine.lastTime;
				this.butler.returning = 0;
				this.setDoorOpened(false);
				const { gender } = this.data;
				const messire = gender === "T" ? "messires" : gender === "W" ? "madame" : "messire";
				this.showBubble(`Thank you for your patience, ${messire}. Feel free to resume your search for ways to escape this room.`, () => {
					this.butler.talking = 0;
					this.monkor.lookLeft = 0;
				}, "Thomas", this.butler);
			}, 3000);
		}, 20000);


	}

	returnButler() {
		if (!this.butler.returning) {
			this.butler.returning = engine.lastTime;
			const { gender } = this.data;
			const Messire = gender === "T" ? "Messires" : gender === "W" ? "Madame" : "Messire";
			const messire = gender === "T" ? "messires" : gender === "W" ? "madame" : "messire";
			this.butler.talking = engine.lastTime;
			this.monkor.lookLeft = engine.lastTime;

			this.showBubble(`My apologies, ${messire}, I have an urgent matter to attend to.`, () => {
				this.butler.talking = 0;
				this.exitButlerToRestroom();
			}, "Thomas", this.butler);	
		}
	}

	addMonkor() {
		super.addMonkor();
		this.spriteFactory.create({
			anim: this.atlas.backwallforeground,
			size: [800, 400],
		});
		if (this.monkor.x < 0) {
			this.monkor.setProperty("paused", true);
			this.openLeft();
			this.monkor.onStill = () => {
				this.monkor.setProperty("paused", false);
				this.setDoorOpened(false);
			};
		}
	}

	getWalkArea() {
		return this.backwall.getCollisionBox(engine.lastTime);		
	}

	refresh(time, dt) {
		super.refresh(time, dt);
		this.updateHost(time);
	}	

	nextLevelLeft() {
		this.engine.setGame(new Lobby());
	}

	nextLevelRight() {
		this.achieve("The First Room");
		this.engine.setGame(new JokerRoom());
	}
}