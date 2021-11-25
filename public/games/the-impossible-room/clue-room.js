class ClueRoom extends GameCore {
	async init(engine, gameName) {
		await super.init(engine, gameName);

		const { gl, config } = engine;
		const { gender } = this.data;
		const I = gender === "T" ? "We" : "I";


		/* Load Audio */
		this.audio = {
			...this.audio,
		};

		this.atlas = {
			...this.atlas,
			cluewall: await engine.addTexture(
				{
					url: "assets/clue-lobby.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .15,
					texture_blend: "source-atop",
					cols: 1, rows: 2,
					range: [1],
				}),
			cluesign: await engine.addTexture(
				{
					url: "assets/clue-lobby.png",
					collision_url: "assets/clue-lobby.png",
					cols: 1, rows: 2,
					range: [0],
				}),
			hand: await engine.addTexture(
				{
					url: "assets/hand.png",
					collision_url: "assets/hand.png",
					texture_url: "assets/skin-texture.jpg",
					texture_alpha: .20,
					texture_blend: "source-atop",
				}),
		};

		this.backwall = this.spriteFactory.create({
			anim: this.atlas.backwall,
			size: [800, 400],
		});
		this.cluewall = this.spriteFactory.create({
			anim: this.atlas.cluewall,
			size: [800, 400],
		});
		this.cluesign = this.spriteFactory.create({
			name: "graffiti",
			anim: this.atlas.cluesign,
			size: [800, 400],
		}, {
			actions: [
				{
					name: "look", message: `There's a message on the wall. It seems partially erased.`,
				},
				{
					name: "read", message: `${I} read: "Need a clue? Email: ... plea... something."`,
				},
			],
		});
		this.spriteFactory.create({
			anim: this.atlas.side_doors,
			size: [800, 400],
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

		this.butler = this.spriteFactory.create({
			name: "Nicolas",
			anim: this.atlas.butler,
			x: 200, y: 340,
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
										response: `Can you give ${me} a hint?`,
										topic: "hint",
									},
									{
										response: `Can you read what's written on the wall?`,
										topic: "read",
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
								message: `I do not have a clue.`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => butler.talking = 0,
							},
							{
								message: `Perhaps the writing on the wall might help, ${messire}.`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => {
									butler.talking = engine.lastTime;
								},
								onEnd: butler => {
									butler.talking = 0;
								},
								exit: true,
							},
							{
								topic: "read",
								message: `It says. Need a clue? Email...`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => butler.talking = 0,
							},
							{
								message: `The rest is not readable.`,
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
								message: "This is called the Room with No Clue.",
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
								message: `We cannot go further without a clue, ${messire}.`,
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

		this.hand = this.spriteFactory.create({
			name: "receiver",
			anim: this.atlas.hand,
			x: 600, y: 220,
			size: [215, 100],
		}, {
			defaultCommand: (item, target) => `deposit ${item.name} on ${target.name}`,
			actions: [
				{ name: "look", condition: hand => !hand.properties.received,
					message: "It's an open hand, waiting to receive something.",
				},
				{
					name: "browse",
					action: hand => {
						this.engine.changeCursor("wait").then(() => {
							openFileDialog(e => {
								this.handOverFile(e.currentTarget.files[0]?.name);
								this.engine.changeCursor(null);
							});
						});
					},
				},
				{ name: "deposit", condition: hand => this.selectedItem === "file" && !hand.properties.received,
					item: ["file"],
					command: (item, target) => `deposit ${typeof(item.name)==="function"?item.name(item):item.name} on ${target.name}.`,
					action: hand => {
						this.handOverFile(this.file.properties.name);
					},
				},
			],
			onChange: {
				received: (hand, received) => {

				},
				stopped: (hand, stopped) => {
					this.setRightOpened(stopped);
				},
			},
		});

		this.sceneData.monkor = this.sceneData.monkor || { x: 120, y: 350 };
	}

	handOverFile(file) {
		const hand = this.hand;
		if (file && file.split(".")[0].toLowerCase().indexOf("clue") >= 0) {
			this.audio.dud.play();
			hand.setProperty("received", this.engine.lastTime);
			this.removeFromInventory("file");
			setTimeout(() => {
				this.showBubble(`Looks like the hand accepted it.`);
			}, 500);
		} else {
			this.showBubble("The hand rejected it. Perhaps it's not the right clue.");
		}

	}

	isRoomSolved() {
		return this.hand.properties.stopped;
	}

	setRightOpened(opened) {
		this.doorForwardOpened.changeOpacity(opened?1:0, engine.lastTime);										
		this.doorForwardClosed.changeOpacity(opened?0:1, engine.lastTime);
		if (this.doorNextLock) {
			this.doorNextLock.changeOpacity(opened?0:1, engine.lastTime);
		}		
		if (opened) {
			this.audio.door.play();
		} else {
			this.audio.hit.play();
		}
	}

	updateHand(time) {
		if (this.hand.properties.received && !this.hand.properties.stopped) {
			const diff = time - this.hand.properties.received;
			this.hand.changePosition(Math.min(900, 600 + diff / 10), this.hand.y, time);
			if (diff > 5000) {
				this.hand.setProperty("stopped", true);
			}
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
					this.butler.changeAnimation(this.monkor.x < this.butler.x ? this.atlas.butler_talk_left : this.atlas.butler_talk_right, time);
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
		this.spriteFactory.create({
			anim: this.atlas.backwallforeground,
			size: [800, 400],
			x: 2,
		});
	}

	getWalkArea() {
		return this.backwall.getCollisionBox(engine.lastTime);		
	}

	refresh(time, dt) {
		super.refresh(time, dt);
		this.updateHost(time);
		this.updateHand(time);
	}	

	nextLevelLeft() {
	}

	nextLevelRight() {
		if (!this.monkor.properties.joker) {
			this.achieve("The Room with No Clue");
			// getMedal("The Room with No Clue", this.onUnlockMedal);
		}
		this.engine.setGame(new DesertRoom());
	}
}

function openFileDialog (callback) {  // this function must be called from  a user
                                              // activation event (ie an onclick event)
    
    // Create an input element
    const inputElement = document.createElement("input");

    // Set its type to file
    inputElement.type = "file";

    // Set accept to the file types you want the user to select. 
    // Include both the file extension and the mime type
    inputElement.accept = "*.*";

    // set onchange event to call callback when user has selected file
    inputElement.addEventListener("change", callback)
    
    // dispatch a click event to open the file dialog
    inputElement.dispatchEvent(new MouseEvent("click")); 
}