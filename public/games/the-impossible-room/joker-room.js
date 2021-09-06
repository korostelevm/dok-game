class JokerRoom extends GameCore {
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
			joker: await engine.addTexture(
			{
				url: "assets/joker.png",
				collision_url: "assets/joker.png",
				cols:1,rows:2,
				range:[0,1],
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
						this.monkor.setProperty("paused", engine.lastTime);
						this.monkor.goal.x = 900;
					},
				},
			],
		});

		const Messire = gender === "T" ? "Messires" : gender === "W" ? "Madame" : "Messire";
		const messire = gender === "T" ? "messires" : gender === "W" ? "madame" : "messire";
		const Iam = gender === "T" ? "We are" : "I am";
		const me = gender === "T" ? "us" : "me";

		this.joker = this.spriteFactory.create({
			name: "Joker",
			anim: this.atlas.joker,
			size: [50, 50],
			x: 500, y: 340,
			hotspot: [25,50],
		}, {
			actions: [
				{ name: "talk",
					action: joker => {
						this.monkor.goal.x = this.joker.x < this.monkor.x ? this.joker.x - 30 : this.joker.x + 30;
						this.startDialog(joker, [
							{
								message: `Howdy?`,
								voiceName: "Hysterical",
								onStart: person => person.talking = engine.lastTime,
								onEnd: person => person.talking = 0,
							},
							{
								responses: [
									{
										response: "What's so funny?",
										topic: "funny",
									},
									{
										response: "How do I get out of this room?",
										topic: "get_out",
									},
									{
										response: "I'll be on my way",
									},
								],
							},
							{
								message: `Ok.`,
								voiceName: "Hysterical",
								onStart: person => person.talking = engine.lastTime,
								onEnd: person => person.talking = 0,
								exit: true,
							},
							{
								topic: "funny",
								message: `You.`,
								voiceName: "Hysterical",
								onStart: person => person.talking = engine.lastTime,
								onEnd: person => person.talking = 0,
								exit: true,
							},
							{
								topic: "get_out",
								message: `Take me.`,
								voiceName: "Hysterical",
								onStart: person => person.talking = engine.lastTime,
								onEnd: person => {
									person.talking = 0;
									person.setProperty("canTake", true);
								},
								exit: true,
							},						
						]);
					},
				},
				{
					name: "take", message: `Alright, ${Iam} taking you with ${me}.`,
					condition: joker => joker.properties.canTake,
					action: item => {
						item.setProperty("pickedUp", true);
						this.addToInventory("joker");
						this.audio.pickup.play();
						this.showBubble(item.pendingMessage);
						item.pendingMessage = null;
						this.openRight();
					},
				},
			],			
			onChange: {
				pickedUp: (joker, pickedUp) => {
					joker.changeOpacity(pickedUp ? 0 : 1, engine.lastTime);
				},
			},
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
										response: "I'll be on my way",
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
								message: "This is called the Joker Room.",
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
								message: `I think that's because there's a Joker in the room.`,
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
	}

	getWalkArea() {
		return this.backwall.getCollisionBox(engine.lastTime);		
	}

	refresh(time, dt) {
		super.refresh(time, dt);
		this.updateHost(time);
	}	

	setNextDoorOpened(opened) {
		this.doorForwardOpened.changeOpacity(opened?1:0, engine.lastTime);										
		this.doorForwardClosed.changeOpacity(opened?0:1, engine.lastTime);
		if (this.doorNextLock) {
			this.doorNextLock.changeOpacity(opened?0:1, engine.lastTime);
		}
	}

	openLeft() {

	}

	openRight() {
		this.setNextDoorOpened(true);
	}

	nextLevelLeft() {
	}

	nextLevelRight() {
		this.engine.setGame(new TimeRoom());
	}
}