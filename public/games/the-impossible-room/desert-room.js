class DesertRoom extends RoomBase {
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
			desert_back: await engine.addTexture(
				{
					url: "assets/desert-room.png",
					cols: 1, rows: 4,
					range: [0],
				}),
			desert_wall: await engine.addTexture(
				{
					url: "assets/desert-room.png",
					collision_url: "assets/desert-room-collision.png",
					cols: 1, rows: 4,
					range: [1],
				}),
			desert_front: await engine.addTexture(
				{
					url: "assets/desert-room.png",
					cols: 1, rows: 4,
					range: [2],
				}),
			desert_cloud: await engine.addTexture(
				{
					url: "assets/desert-room.png",
					cols: 1, rows: 4,
					range: [3],
				}),
		};

		this.background = this.spriteFactory.create({
			anim: this.atlas.desert_back,
			size: [800, 400],
		});
		this.cloud = this.spriteFactory.create({
			anim: this.atlas.desert_cloud,
			size: [800, 400],
		});
		this.cloud2 = this.spriteFactory.create({
			anim: this.atlas.desert_cloud,
			x: 800,
			size: [800, 400],
		});
		this.backwall = this.spriteFactory.create({
			anim: this.atlas.desert_wall,
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

		const moreHints = [
			"",
			`Whatever you do, you should remain calm.`,
			`Do not try to walk or run around, the quicksand might swallow you.`,
			`Really, you are still stuck? Damn it, just sink into the quicksand already!`,
		];


		this.butler = this.spriteFactory.create({
			name: "Nicolas",
			anim: this.atlas.butler,
			x: 200, y: 340,
			size: [96,192],
		}, {
			actions: [
				{ name: "talk",
					action: butler => {
						this.startDialog(butler, [
							{
								message: `Yes, ${messire}?`,
								voiceName: "Thomas",
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => {
									butler.talking = 0;
									butler.angry = false;
								},
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
										condition: () => this.hintIndex && this.monkor.properties.stuck,
										response: () => this.hintIndex === moreHints.length - 1 ? `${I} suck at this. Just tell ${me} what to do!` : `Can you give ${me} another hint?`,
										topic: "more_hint"
									},
									{
										response: `Can you help ${me} get out of the quicksand?`,
										topic: "quicksand",
										condition: () => this.monkor.properties.stuck,
									},
									{
										response: () => this.monkor.properties.stuck ? `I guess ${I}'ll have to find a way out, since you won't help ${me}.` : `${I}'ll be on ${my} way`,
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
								message: () => this.monkor.properties.stuck ? `It seems you are stuck in quicksand. I would be careful.` : `I do not have any hint for this room, ${messire}.`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => butler.talking = 0,
							},
							{
								message: () => this.monkor.properties.stuck ? `If you move too much, you might sink deeper.` : `This is just a room full of sand.`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => {
									butler.talking = 0;
									if (this.allowExtraHints() && this.monkor.properties.stuck) {
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
								onStart: butler => {
									if (this.hintIndex === moreHints.length - 1) {
										this.butler.angry = true;
									}
									butler.talking = engine.lastTime;
								},
								onEnd: butler => {
									butler.talking = 0;
									this.hintIndex = ((this.hintIndex || 0) + 1) % moreHints.length;
								},
								exit: true,
							},
							{
								topic: "quicksand",
								message: () => `I would love to help, ${messire}.`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => butler.talking = 0,
							},
							{
								message: () => `But I could become stuck in the quicksand as well.`,
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
								message: "This is called the Desert Room.",
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
								message: `I'm guessing it's because it's full of sand.`,
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
		this.butler.reachable = true;
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

	addMonkor() {
		super.addMonkor();
		this.desertFront = this.spriteFactory.create({
			anim: this.atlas.desert_front,
			size: [800, 400],
		});
	}

	getWalkArea() {
		return this.backwall.getCollisionBox(engine.lastTime);		
	}

	refresh(time, dt) {
		super.refresh(time, dt);
		this.updateHost(time);
		this.updateMonkor(time);
	}

	updateMonkor(time) {
		if (this.monkor.x > 400 || this.monkor.properties.stuck) {
			this.monkor.changePosition(400, this.monkor.y, this.monkor.z, time);
			if (!this.monkor.properties.stuck) {
				this.monkor.setProperty("stuck", time);
			}
		}
		const { gender } = this.data;
		const I = gender === "T" ? "We" : "I";
		if (this.monkor.properties.stuck) {
			if (this.monkor.y < 400) {
				this.monkor.changePosition(this.monkor.x, this.monkor.y + 4, this.monkor.z, time);
			}
			if (this.monkor.anim === this.atlas.monkor_run_left || this.monkor.anim === this.atlas.monkor_run_right || this.monkor.y > 450) {
				this.monkor.changePosition(this.monkor.x, this.monkor.y + .5, this.monkor.z, time);
			}
			if (this.monkor.y >= 550 && !this.changingScene) {
				this.changingScene = true;
				this.engine.setGame(new DesertFar());
			}
			if ((this.monkor.x !== this.monkor.goal.x || this.monkor.y !== this.monkor.goal.y) && !this.monkor.willStop) {
				this.monkor.willStop = time + 1000;
			}
			if (this.monkor.willStop && time > this.monkor.willStop) {
				this.monkor.willStop = 0;
				this.monkor.goal.x = this.monkor.x;
				this.monkor.goal.y = this.monkor.y;

				if (!this.noticedStuck) {
					this.noticedStuck = true;
					this.monkor.paused = true;
					setTimeout(() => {
						this.showBubble(`It look's like ${I}'m stuck.`, () => {
							this.monkor.paused = false;
						});
					}, 1000);
				}				
			}
		}
	}

	canRunRight() {
		return this.monkor.properties.stuck;
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