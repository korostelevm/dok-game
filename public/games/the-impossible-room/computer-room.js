class ComputerRoom extends GameCore {
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
			computer_desk: await engine.addTexture({
				url: "assets/computer-desk.png",
				collision_url: "assets/computer-desk.png",
				cols:1,rows:4,
				range:[0],
			}),
			computer_desk_monkor: await engine.addTexture({
				url: "assets/computer-desk.png",
				collision_url: "assets/computer-desk.png",
				cols:1,rows:4,
				range:[1],
			}),
			computer_desk_nuna: await engine.addTexture({
				url: "assets/computer-desk.png",
				collision_url: "assets/computer-desk.png",
				cols:1,rows:4,
				range:[2],
			}),
			computer_desk_twin: await engine.addTexture({
				url: "assets/computer-desk.png",
				collision_url: "assets/computer-desk.png",
				cols:1,rows:4,
				range:[3],
			}),

			other_monkor: await engine.addTexture({
				url: "assets/monkor.png",
				collision_url: "assets/monkor.png",
				cols:5,
				rows:5,
				range:[0],
			}),
			other_nuna: await engine.addTexture({
				url: "assets/nuna.png",
				collision_url: "assets/nuna.png",
				cols:5,
				rows:5,
				range:[0],
			}),
			other_twin: await engine.addTexture({
				url: "assets/twin.png",
				collision_url: "assets/twin.png",
				cols:6,
				rows:6,
				range:[0],
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
		const Sir = gender === "M" ? "Sir" : gender === "W" ? "Madam" : "Guys";
		const sir = gender === "M" ? "sir" : gender === "W" ? "madam" : "guys";
		const He_doesnt = gender === "M" ? "He doesn't" : gender === "W" ? "She doesn't" : "They don't";
		const He_is = gender === "M" ? "He is" : gender === "W" ? "She is" : "They are";
		const Someone_is = gender === "M" ? "Someone is" : gender === "W" ? "Someone is" : "Two dudes are";



		let computerAnim = this.atlas.computer_desk;
		if (this.engine.inception) {
			switch (this.engine.swapData["TheImpossibleRoom"].gender) {
				case "":
					computerAnim = this.atlas.computer_desk;
					break;
				case "M":
					computerAnim = this.atlas.computer_desk_monkor;
					break;
				case "W":
					computerAnim = this.atlas.computer_desk_nuna;
					break;
				case "T":
					computerAnim = this.atlas.computer_desk_twin;
					break;
				default:
					throw new Error("Invalid gender: " + this.engine.swapData["TheImpossibleRoom"].gender);
					break;
			}
		}


		this.computer_desk = this.spriteFactory.create({
			name: "Computer Desk",
			anim: computerAnim,
			size: [400, 200],
			x: 300, y: 170,
		}, {
			actions: [
				{ name: "look", condition: () => this.engine.inception,
					message: () => {
						const { gender } = this.engine.swapData["TheImpossibleRoom"];
						const sir = gender === "M" ? "sir" : gender === "W" ? "madam" : "guys";
						const He_doesnt = gender === "M" ? "He doesn't" : gender === "W" ? "She doesn't" : "They don't";
						const He_is = gender === "M" ? "He is" : gender === "W" ? "She is" : "They are";
						const Someone_is = gender === "M" ? "Someone is" : gender === "W" ? "Someone is" : "Two dudes are";
						return `${Someone_is} using the computer. ${He_is} playing a game that looks pretty familiar.`;
					},
					lookup: 1000,
				},
				{ name: "look", condition: () => !this.engine.inception,
					message: "It's a computer desk in the middle of the room. I wonder what it's for.",
					lookup: 1000,
				},
				{ name: "sit", condition: () => !this.engine.inception,
					action: computer_desk => {
						this.achieve("The Computer");
						// getMedal("The Computer", this.onUnlockMedal);

						const { gender } = this.data;
						this.engine.playerOverlay.setInception(true, {
							computerGender: gender,
						}, GameTitle);
					},
				},
				{ name: "talk", condition: () => this.engine.inception,
					lookup: 1000,
					action: computer_desk => {
						const { gender } = this.engine.swapData["TheImpossibleRoom"];
						const sir = gender === "M" ? "sir" : gender === "W" ? "madam" : "guys";
						const He_doesnt = gender === "M" ? "He doesn't" : gender === "W" ? "She doesn't" : "They don't";
						const He_is = gender === "M" ? "He is" : gender === "W" ? "She is" : "They are";
						const Someone_is = gender === "M" ? "Someone is" : gender === "W" ? "Someone is" : "Two dudes are";
						this.monkor.alwaysLookup = true;
						this.showBubble(`Hello ${sir}.`, () => {
							setTimeout(() => {
								this.monkor.alwaysLookup = false;
								this.showBubble(`${He_doesnt} seem to react. ${He_is} very focused on the game.`);
							}, 3000);
						});
					},
				},
			],
		});

		this.doorForwardClosed = this.spriteFactory.create({
			anim: this.atlas.right_door,
			size: [800, 400],
		});

		const I = gender === "T" ? "We" : "I";

		this.sceneData.monkor = this.sceneData.monkor || { x: 120, y: 350 };
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
		if (!this.engine.inception
			&& this?.engine?.swapData?.TheImpossibleRoom?.sceneTag === this.constructor.name
			&& this?.engine?.swapData?.TheImpossibleRoom?.ComputerRoom?.monkor) {
			const { x, y } = this.engine.swapData.TheImpossibleRoom.ComputerRoom.monkor;
			const { gender, name } = this.engine.swapData["TheImpossibleRoom"];
			this.otherMonkor = this.spriteFactory.create({
				name,
				x, y,
				size: [128, 128],
				anim: gender === "M" ? this.atlas.other_monkor : gender === "W" ? this.atlas.other_nuna : this.atlas.other_twin,
			}, {
				actions: [
					{ name: "talk",
						action: computer_desk => {
							const { gender } = this.engine.swapData["TheImpossibleRoom"];
							const sir = gender === "M" ? "sir" : gender === "W" ? "madam" : "guys";
							const He_doesnt = gender === "M" ? "He doesn't" : gender === "W" ? "She doesn't" : "They don't";
							const He_is = gender === "M" ? "He is" : gender === "W" ? "She is" : "They are";
							const Someone_is = gender === "M" ? "Someone is" : gender === "W" ? "Someone is" : "Two dudes are";
							this.monkor.goal.x = this.otherMonkor.x - 100;
							this.monkor.setProperty("paused", true);
							this.monkor.onStill = () => {
								this.monkor.setProperty("paused", false);
								this.showBubble(`Hello ${sir}. Have you seen the host, Nicolas Debossin?`, () => {
									setTimeout(() => {
										this.showBubble(`${He_doesnt} seem to react. ${He_is} staring at the 4th wall.`);
									}, 3000);
								});
							};
						},
					},
				],
			});;
		}

		super.addMonkor();

		const { gender } = this.data;
		const messire = gender === "T" ? "messires" : gender === "W" ? "madame" : "messire";

		this.spriteFactory.create({
			anim: this.atlas.backwallforeground,
			size: [800, 400],
		});
		if (this.isFirstTime()) {
			this.monkor.changePosition(100, 360, this.monkor.z, this.engine.lastTime);
			this.monkor.setProperty("paused", true);
			this.monkor.goal.x = 250;
			this.monkor.onStill = () => {
				this.monkor.lookLeft = true;
				setTimeout(() => {
					this.monkor.lookLeft = false;
					this.showBubble(`Where did Nicolas Debossin go?`, () => {
						this.monkor.setProperty("paused", false);
					});			
				}, 1000);
			};
		} else {
			this.monkor.goal.x = this.monkor.x;
		}

		this.putBackJoker();
		this.setRightOpened(true);
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

	getWalkArea() {
		return this.backwall.getCollisionBox(engine.lastTime);		
	}

	refresh(time, dt) {
		super.refresh(time, dt);
	}	

	openLeft() {

	}

	openRight() {
		
	}

	nextLevelLeft() {
	}

	onInception(inception) {		
		const { gender } = this.data;
		const I = gender === "T" ? "We" : "I";
		this.monkor.setProperty("paused", true);
		if (!inception) {
			this.showBubble(`This is a fun game! ${I} wish ${I} could give it a 5-star rating.`, () => {
				this.monkor.setProperty("paused", false);
			});
		}
	}

	nextLevelRight() {
		this.engine.setGame(new ImpossibleRoom());
	}
}