class BatmanRoom extends GameCore {
	async init(engine, gameName) {
		await super.init(engine, gameName);

		const { gl, config } = engine;
		const { gender } = this.data;

		/* Load Audio */
		this.audio = {
			...this.audio,
			punch: new Sound("audio/hit.mp3", 1),
			im_batman: new Sound("audio/im-batman.mp3", 1),
			joker: new Sound("audio/joker.mp3", 1),
		};

		this.atlas = {
			...this.atlas,
			batman: await engine.addTexture(
				{
					url: "assets/batman.png",
					cols: 5, rows: 6,
					range: [0],
				}),
			batman_punch: await engine.addTexture(
				{
					url: "assets/batman.png",
					cols: 5, rows: 6,
					range: [1, 8],
					frameRate: 12,
				}),			
			batman_punch_still: await engine.addTexture(
				{
					url: "assets/batman.png",
					cols: 5, rows: 6,
					range: [8],
				}),			
			batman_punch_talk: await engine.addTexture(
				{
					url: "assets/batman.png",
					cols: 5, rows: 6,
					range: [8, 11],
					frameRate: 12,
				}),			
			batman_walk: await engine.addTexture(
				{
					url: "assets/batman.png",
					cols: 5, rows: 6,
					range: [12, 19],
					frameRate: 12,
				}),
			batman_lifting: await engine.addTexture(
				{
					url: "assets/batman.png",
					cols: 5, rows: 6,
					range: [20, 25],
					frameRate: 15,
				}),			
			batman_lift: await engine.addTexture(
				{
					url: "assets/batman.png",
					cols: 5, rows: 6,
					range: [25],
					frameRate: 12,
				}),			
			batman_lift_talk: await engine.addTexture(
				{
					url: "assets/batman.png",
					cols: 5, rows: 6,
					range: [25, 26],
					frameRate: 12,
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
								message: `I do not know, ${messire}.`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => butler.talking = 0,
							},
							{
								message: `Nobody dares to mess with Batman.`,
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
								message: `No ${messire}, this is the Batman room.`,
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
								message: "Batman won't let anyone pass.",
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

		this.setRightOpened(true);



		this.sceneData.monkor = this.sceneData.monkor || { x: 120, y: 350 };
	}

	butlerKeepStill() {
		return false;
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

		this.batman = this.spriteFactory.create({
			name: "Batman",
			anim: this.atlas.batman,
			x: 600, y: 380,
			size: [240, 240],
			hotspot: [120, 240],
		}, {
			onFrame: {
				4: (batman, previousFrame) => {
					if (previousFrame !== 4) {
						this.audio.punch.play();
						this.audio.scream.play();
						this.monkor.setProperty("paused", true);
						this.monkor.changeRotation(90, this.engine.lastTime);
						this.monkor.punched = this.engine.lastTime;
					}
				},
				8: batman => {
					if (batman.anim === this.atlas.batman_punch) {
						batman.changeAnimation(this.atlas.batman_punch_still, this.engine.lastTime);
						setTimeout(() => {
							batman.changeAnimation(this.atlas.batman_punch_talk, this.engine.lastTime);
							this.audio.im_batman.play();
							setTimeout(() => {
								batman.changeAnimation(this.atlas.batman_punch_still, this.engine.lastTime);
							}, 700);
						}, 1000);
						setTimeout(() => {
							batman.changeAnimation(this.atlas.batman, this.engine.lastTime);
						}, 3000);
					}
				},
				20: batman => {
					this.joker.changePosition(this.batman.x - 60, this.batman.y - 150, this.engine.lastTime);
				},
				23: batman => {
					this.joker.changePosition(this.batman.x - 40, this.batman.y - 170, this.engine.lastTime);
				},
				25: batman => {
					if (batman.anim === this.atlas.batman_lifting) {
						batman.changeAnimation(this.atlas.batman_lift, this.engine.lastTime);						
					}
				},
			},
		});

		this.spriteFactory.create({
			anim: this.atlas.backwallforeground,
			size: [800, 400],
		});

		if (this.batman.properties.liftJoker) {
			this.batman.changeOpacity(0, this.engine.lastTime);
			this.joker.changeOpacity(0, this.engine.lastTime);
		}
	}

	getWalkArea() {
		return this.backwall.getCollisionBox(engine.lastTime);		
	}

	refresh(time, dt) {
		super.refresh(time, dt);
		this.updateHost(time);
		this.updateBatman(time);
	}

	isBatmanRoom() {
		return true;
	}

	canUseJoker() {
		return true;
	}

	onJoker(putDown) {
		if (putDown && this.monkor.properties.joker === "BatmanRoom" && !this.batman.properties.liftJoker) {
			this.monkor.setProperty("paused", true);
			this.monkor.goal.x = Math.max(80, this.monkor.x - 100);
			setTimeout(() => {
				this.batman.goalX = () => this.joker.x;
			}, 1000);
		} else {
			this.batman.goalX = null;
		}
	}

	updateBatman(time) {
		if (this.batman.opacity <= 0) {
			return;
		}
		if (!this.batman.properties.liftJoker && this.monkor.x > 520) {
			if (this.batman.anim === this.atlas.batman) {
				this.monkor.goal.x = this.monkor.x;
				this.monkor.goal.y = this.monkor.y;
				this.batman.changeAnimation(this.atlas.batman_punch, time);
			}
		}
		if (this.monkor.punched) {
			const t = (time - this.monkor.punched) / 500;
			this.monkor.changePosition(520 - Math.min(1, t) * 200, this.monkor.y, time);
			this.monkor.goal.x = this.monkor.x;
			this.monkor.goal.y = this.monkor.y;
			if (t >= 8) {
				this.monkor.punched = 0;
				this.monkor.setProperty("paused", null);
				this.monkor.changeRotation(0, this.engine.lastTime);					
			}
		}
		if (this.batman.goalX) {
			const x = this.batman.goalX();
			const dx = x - this.batman.x;
			const dist = Math.abs(dx);
			if (dist > 20 && !this.batman.properties.liftJoker) {
				this.batman.changeAnimation(this.atlas.batman_walk, time);
				this.batman.changePosition(this.batman.x + dx / dist * 2, this.batman.y, time);
			} else {				
				if (!this.batman.properties.liftJoker) {
					this.batman.changeAnimation(this.atlas.batman_lifting, time);
					this.joker.setProperty("canTake", false);
					this.batman.setProperty("liftJoker", true);
					setTimeout(() => {
						this.batman.changeAnimation(this.atlas.batman_lift_talk, this.engine.lastTime);
						this.audio.im_batman.play();
						setTimeout(() => {
							this.batman.changeAnimation(this.atlas.batman_lift, this.engine.lastTime);
							this.audio.joker.play();
							this.monkor.setProperty("paused", false);
							setTimeout(() => {
								this.sayImBatman();
							}, 2000);
						}, 700);
					}, 1000);
				}
			}
		}
	}

	sayImBatman() {
		if (this.engine.game !== this) {
			return;
		}
		this.batman.changeAnimation(this.atlas.batman_lifting, this.engine.lastTime);
		setTimeout(() => {
			this.batman.changeAnimation(this.atlas.batman_lift_talk, this.engine.lastTime);
			this.audio.im_batman.play();
			setTimeout(() => {
				this.batman.changeAnimation(this.atlas.batman_lift, this.engine.lastTime);
				this.audio.joker.play();
				setTimeout(() => {
					this.sayImBatman();
				}, 2000 + Math.random() * 2000);
			}, 700);
		}, 1000);

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

	isRoomSolved() {
		return true;
	}


	openLeft() {

	}

	openRight() {
		
	}

	nextLevelLeft() {
	}

	butlerKeepStill() {
		return true;
	}

	nextLevelRight() {
		this.achieve("Batman");
		// getMedal("Batman", this.onUnlockMedal);
		this.engine.setGame(new ComputerRoom());
	}
}