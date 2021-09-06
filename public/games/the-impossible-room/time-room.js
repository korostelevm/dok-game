class TimeRoom extends GameCore {
	async init(engine, gameName) {
		await super.init(engine, gameName);

		const { gl, config } = engine;
		const { gender } = this.data;

		const I = gender === "T" ? "We" : "I";
		const my = gender === "T" ? "our" : "my";
		const My = gender === "T" ? "Our" : "My";

		/* Load Audio */
		this.audio = {
			...this.audio,
		};

		this.atlas = {
			...this.atlas,
			rolling_carpet_still: await engine.addTexture(
				{
					url: "assets/time-room.png",
					cols:2,rows:3,
					range:[0],
				}),
			rolling_carpet_rolling: await engine.addTexture(
				{
					url: "assets/time-room.png",
					cols:2,rows:3,
					frameRate:11,
					range:[0,2],
				}),
			red_button: await engine.addTexture(
				{
					url: "assets/time-room.png",
					collision_url: "assets/time-room.png",
					cols:2,rows:3,
					range:[4],
				}),
			signs: await engine.addTexture(
				{
					url: "assets/time-room.png",
					cols:2,rows:3,
					range:[3],
				}),
			one_minute: await engine.addTexture(
				{
					url: "assets/time-room.png",
					collision_url: "assets/time-room.png",
					cols:2,rows:3,
					range:[5],
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
		this.rollingCarpet = this.spriteFactory.create({
			name: "Rolling Carpet",
			anim: this.atlas.rolling_carpet_still,
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
				{ name: "walk through", condition: () => this.canGoThrough(),
					action: forward_door => {
						if (this.canGoThrough()) {
							this.monkor.setProperty("paused", this.engine.lastTime);
							this.monkor.goal.x = 900;
							this.walkingThrough = true;
						} else {
							this.showBubble(`${I} can't go through. The door is now closed.`, () => {
							});							
						}
					},
				},
			],
		});

		const Messire = gender === "T" ? "Messires" : gender === "W" ? "Madame" : "Messire";
		const messire = gender === "T" ? "messires" : gender === "W" ? "madame" : "messire";

		this.spriteFactory.create({
			anim: this.atlas.one_minute,
			size: [800, 400],
		}, {

		});

		this.signs = this.spriteFactory.create({
			anim: this.atlas.signs,
			size: [800, 400],
		}, {

		});

		this.redButton = this.spriteFactory.create({
			name: "Red Button",
			anim: this.atlas.red_button,
			size: [800, 400],
		}, {
			actions: [
				{ name: "look", condition: button => !this.isCarpetRolling(),
					message: `It's a big red button that says "one minute" on it.`,
					lookup: 500,
				},
				{ name: "push button", condition: button => !this.isCarpetRolling(),
					lookup: 100,
					action: entrance => {
						if (this.redButton.properties.pushed) {
							this.redButton.setProperty("pushed", null);
							document.getElementById("clock-1").classList.remove("blink_me");
						} else {
							const timeIn60 = this.getTime(60);
							this.redButton.setProperty("pushed", timeIn60);
							this.redButton.setProperty("pushedOnce", true);
						}
					},
				},
			],
		});

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
								onStart: butler => butler.talking = this.engine.lastTime,
								onEnd: butler => butler.talking = 0,
							},
							{
								topic: "questions",
								responses: [
									{
										response: "Is this the impossible room?",
										topic: "impossible",
									},
									{
										response: "What does the red button do?",
										condition: () => !this.redButton.properties.pushedOnce,
										topic: "button",
									},
									{
										response: "Can you push this red button for me?",
										condition: () => this.redButton.properties.pushedOnce,
										topic: "push_for_me",
									},
									{
										response: "How do I get out of this room?",
										topic: "how_get_out",
									},
									{
										response: "I'll be on my way",
									},
								],
							},
							{
								message: `Au revoir, ${messire}.`,
								voiceName: "Thomas",
								onStart: butler => butler.talking = this.engine.lastTime,
								onEnd: butler => butler.talking = 0,
								exit: true,
							},
							{
								topic: "push_for_me",
								message: `D'accord, ${messire}`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => {
									butler.talking = this.engine.lastTime;
								},
								onEnd: butler => {
									butler.talking = 0;
									if (this.redButton.properties.pushed) {
										this.redButton.setProperty("pushed", null);
										document.getElementById("clock-1").classList.remove("blink_me");
									} else {
										const timeIn60 = this.getTime(60);
										this.redButton.setProperty("pushed", timeIn60);
										document.getElementById("clock-2").textContent = this.redButton.properties.pushed;
									}
								},
								exit: true,
							},
							{
								topic: "how_get_out",
								message: `It is impossible, because nobody can reach the door within one minute.`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => {
									butler.talking = this.engine.lastTime;
								},
								onEnd: butler => {
									butler.talking = 0;
								},
								next: "questions",
							},
							{
								topic: "button",
								message: `Why don't you push it to find out, ${messire}?`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => {
									butler.talking = this.engine.lastTime;
								},
								onEnd: butler => {
									butler.talking = 0;
								},
								next: "questions",
							},
							{
								topic: "impossible",
								message: `No ${messire}, this is not yet the impossible room.`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => {
									butler.talking = this.engine.lastTime;
								},
								onEnd: butler => {
									butler.talking = 0;
								},
							},
							{
								message: "This is called the Time Room. A room to be completed in an impossible time.",
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => {
									butler.talking = this.engine.lastTime;
								},
								onEnd: butler => {
									butler.talking = 0;
								},
							},
							{
								message: `You must complete this room in order to continue further to the next room, ${messire}.`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => {
									butler.talking = this.engine.lastTime;
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

		this.title = document.getElementById("title");
		this.title.style.display = "";
		this.title.style.opacity = .5;
		document.getElementById("im").style.display = "";
		document.getElementById("im").textContent = "";

		this.sceneData.monkor = this.sceneData.monkor || { x: 120, y: 350 };
	}

	canGoThrough() {
		return this.isCarpetRolling() || this.properties.joker;		
	}

	openLeft() {
		this.doorBack.changeOpacity(0, this.engine.lastTime);
	}

	openRight() {
		this.setNextDoorOpened(true);
	}

	canUseJoker() {
		return true;
	}

	setNextDoorOpened(opened) {
		this.doorForwardOpened.changeOpacity(opened?1:0, engine.lastTime);										
		this.doorForwardClosed.changeOpacity(opened?0:1, engine.lastTime);
	}

	isCarpetRolling() {
		return this.redButton.properties.pushed && this.getTime() !== this.redButton.properties.pushed;
	}

	updateClock() {
		const seconds = this.getTime(0);
		if (this.sec === seconds) {
			return;
		}
		this.sec = seconds;
		document.getElementById("im").textContent = seconds;
		document.getElementById("clock-1").textContent = seconds;
	}

	getTime(secondsOffset) {
		const date = new Date();
		if (secondsOffset) {
			date.setSeconds(date.getSeconds() + secondsOffset);
		}

		const hour = "" + date.getHours();
		const minutes = "" + date.getMinutes();
		const seconds = "" + date.getSeconds();
		return `${hour.padStart(2, 0)}:${minutes.padStart(2, 0)}:${seconds.padStart(2, 0)}`;
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

	async postInit() {
		await super.postInit();
		this.spriteFactory.create({
			anim: this.atlas.backwallforeground,
			size: [800, 400],
		});
		this.walkingThrough = false;
		document.getElementById("time-room-labels").style.display = "";
	}

	getWalkArea() {
		return this.backwall.getCollisionBox(this.engine.lastTime);		
	}

	refresh(time, dt) {
		super.refresh(time, dt);
		this.updateHost(time);
		this.checkRollingCarpet(time);
		this.updateClock();
	}	

	onExit(engine) {
		document.getElementById("time-room-clock").style.display = "none";
		document.getElementById("time-room-labels").style.display = "none";
		super.onExit(engine);
	}

	checkRollingCarpet(time) {
		const rolling = this.isCarpetRolling();
		if (this.wasCarpetRolling === rolling) {
			return;
		}
		this.wasCarpetRolling = rolling;
		const animation = rolling ? this.atlas.rolling_carpet_rolling : this.atlas.rolling_carpet_still;
		this.rollingCarpet.changeAnimation(animation, time);
		document.getElementById("time-room-clock").style.display = rolling ? "" : "none";
		this.setNextDoorOpened(rolling && !this.walkingThrough);
		if (!rolling) {
			this.redButton.setProperty("pushed", null);
			document.getElementById("clock-1").classList.remove("blink_me");
		} else {
			this.audio.beep.play();
			document.getElementById("clock-2").textContent = this.redButton.properties.pushed;
			document.getElementById("clock-1").classList.add("blink_me");			
		}
	}


	nextLevelLeft() {
	}

	nextLevelRight() {
	}
}