class MathRoom extends GameCore {
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
			chalkboard: await engine.addTexture(
				{
					url: "assets/chalkboard.png",
					collision_url: "assets/chalkboard.png",
					texture_url: "assets/skin-texture.jpg",
					texture_alpha: .20,
					texture_blend: "source-atop",
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
		this.chalkboard = this.spriteFactory.create({
			name: "chalkboard",
			anim: this.atlas.chalkboard,
			size: [800, 400],
		}, {
			reachable: true,
			actions: [
				{ name: "look", message: "There's a math formula on the chalkboard, but it keeps changing.",
				},
			],			
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
			`The formula keeps changing, but not the result.`,
			`You need two equations to solve two variables.`,
			`Really, you are still stuck? What do you use to keep an image in your mind.`,
		];

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
										topic: "au-revoir",
									},
								],
							},
							{
								topic: "au-revoir",
								message: `Au revoir, ${messire}.`,
								voiceName: "Thomas",
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => butler.talking = 0,
								exit: true,
							},
							{
								topic: "hint",
								message: `The formula changes every 100 milliseconds, so you must calculate faster than that.`,
								voiceName: "Thomas",
								secondsAfterEnd: 2,
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => {
									butler.talking = 0;
								},
							},
							{
								message: `Unless you can stop time, ${messire}.`,
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
								message: "This is called the Math Room.",
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
								message: `You must solve the quantum formula written on the chalkboard to pass this room, ${messire}.`,
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
										response: `How can ${I} do that? The formula keeps changing.`,
										topic: "how",
									},
									{
										response: `What is a quantum formula?`,
									},
									{
										response: `Ok, ${I} better start calculating.`,
										topic: "au-revoir",
									},
								],
							},
							{
								topic: "quantum",
								message: `A quantum formula is a math formula that's different in every parallel universe.`,
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
								topic: "how",
								message: `You can't, ${messire}. That's why this room is impossible.`,
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

		this.mathBoard = document.getElementById("math-board");
		this.mathX = Math.floor(Math.random() * 1000);
		this.mathY = Math.floor(Math.random() * 100);

		this.mathResult = document.getElementById("math-result");
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
		});
	}

	getWalkArea() {
		return this.backwall.getCollisionBox(engine.lastTime);		
	}

	refresh(time, dt) {
		super.refresh(time, dt);
		this.updateHost(time);
		this.updateMathBoard(time);
	}

	async postInit() {
		await super.postInit();
		document.getElementById("math-group").style.display = "block";
	}

	onExit(engine) {
		document.getElementById("math-group").style.display = "none";		
		super.onExit(engine);
	}

	updateMathBoard(time) {
		if (time < this.nextUpdate) {
			return;
		}
		this.nextUpdate = time + Math.random() * 100;
		const coefX = Math.ceil(40 * (Math.random() - .5)) || 1;
		const coefY = Math.ceil(40 * (Math.random() - .5)) || 1;
		const result = coefX * this.mathX + coefY * this.mathY;
		this.mathBoard.innerText = `${coefX}x ${coefY<0?"-":"+"} ${Math.abs(coefY)}y = ${result}\n`;
		if (this.mathResult.value == this.mathX) {
			if (!this.openingDoor) {
				this.openingDoor = true;
				setTimeout(() => {
					if (this.mathResult.value == this.mathX) {
						this.setRightOpened(true);
					} else {
						this.setRightOpened(false);
						this.openingDoor = false;
					}
				}, 2000);
			}
		} else {
			this.setRightOpened(false);
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
			this.achieve("The Math Room");
			// getMedal("The Math Room", this.onUnlockMedal);
		}
		this.engine.setGame(new Restaurant());
	}
}