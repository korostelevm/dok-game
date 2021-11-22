class GandalfRoom extends GameCore {
	async init(engine, gameName) {
		await super.init(engine, gameName);

		const { gl, config } = engine;
		const { gender } = this.data;
		const me = gender === "T" ? "us" : "me";
		const my = gender === "T" ? "our" : "my";
		const I = gender === "T" ? "We" : "I";
		const My = gender === "T" ? "Our" : "My";

		/* Load Audio */
		this.audio = {
			...this.audio,
		};

		this.atlas = {
			...this.atlas,
			gandalf_back: await engine.addTexture(
				{
					url: "assets/gandalf.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .2,
					texture_blend: "source-atop",
					cols:2,rows:6,
					frameRate: 10,
					range:[0,3],
				}),
			gandalf: await engine.addTexture(
				{
					url: "assets/gandalf.png",
					collision_url: "assets/gandalf.png",
					cols:2,rows:6,
					range:[4],
				}),
			gandalf_talk: await engine.addTexture(
				{
					url: "assets/gandalf.png",
					collision_url: "assets/gandalf.png",
					cols:2,rows:6,
					frameRate: 15,
					range:[4,5],
				}),
			gandalf_pass: await engine.addTexture(
				{
					url: "assets/gandalf.png",
					collision_url: "assets/gandalf.png",
					cols:2,rows:6,
					range:[6],
				}),
			gandalf_pass_talk: await engine.addTexture(
				{
					url: "assets/gandalf.png",
					collision_url: "assets/gandalf.png",
					cols:2,rows:6,
					frameRate: 15,
					range:[6,7],
				}),
			exit: await engine.addTexture(
				{
					url: "assets/gandalf.png",
					collision_url: "assets/gandalf.png",
					cols:2,rows:6,
					range:[8],
				}),
			hit: await engine.addTexture(
				{
					url: "assets/gandalf.png",
					collision_url: "assets/gandalf.png",
					cols:2,rows:6,
					range:[9],
				}),
			gandalf_hit: await engine.addTexture(
				{
					url: "assets/gandalf.png",
					collision_url: "assets/gandalf.png",
					cols:2,rows:6,
					range:[10],
				}),
		};

		this.backwall = this.spriteFactory.create({
			anim: this.atlas.backwall,
			size: [800, 400],
		});

		this.background = this.spriteFactory.create({
			anim: this.atlas.gandalf_back,
			size: [800, 400],
		});

		this.gandalf = this.spriteFactory.create({
			name: "Gandalf",
			anim: this.atlas.gandalf,
			size: [800, 400],
		}, {
			bubbleTop: -50,
			actions: [
				{
					name: "look",
					message: "There's an old man in pyjamas wearing a dunce hat and a candy cane."
				},
				{
					name: "talk",
					action: gandalf => {
						gandalf.setProperty("pass", null);
						this.monkor.goal.x = 380;
						this.monkor.goal.y = 300;
						this.startDialog(gandalf, [
							{
								message: `No one shall pass.`,
								voiceName: "Ralph",
								onStart: gandalf => gandalf.setProperty("talking", this.engine.lastTime),
								onEnd: gandalf => gandalf.setProperty("talking", null),
							},
							{
								responses: [
									{
										response: `Can you just let ${me} pass?`,
										topic: "let_me_pass",
										condition: () => !this.canPass(),
									},
									{
										response: `Can you just let ${me} pass?`,
										topic: "let_me_pass_2",
										condition: () => this.canPass(),
									},
									{
										response: `Why do you let no one pass?`,
										topic: "why",
									},
									{
										response: () => `${I} put down the Joker. Can you let ${me} pass?`,
										topic: "joker",
										condition: () => {
											return this.monkor.properties.joker === this.constructor.name;
										},
									},
									{
										response: () => `${My} name is ${this.data.name}, and you will let ${me} pass!`,
										topic: "no_one",
										condition: () => this.canPass(),
									},
									{
										response: () => `${My} name is ${this.data.name}, and you will let ${me} pass!`,
										topic: "my_name",
										condition: () => !this.canPass(),
									},
									{
										response: `${I}'ll be on ${my} way`,
									},
								],
							},
							{
								message: `But you shall not pass.`,
								voiceName: "Ralph",
								secondsAfterEnd: 1,
								onStart: gandalf => gandalf.setProperty("talking", this.engine.lastTime),
								onEnd: gandalf => gandalf.setProperty("talking", null),
								exit: true,
							},
							{
								topic: "unwanted-item",
								message: `No thanks.`,
								voiceName: "Ralph",
								onStart: gandalf => gandalf.setProperty("talking", this.engine.lastTime),
								onEnd: gandalf => gandalf.setProperty("talking", null),
								next: previousIndex => previousIndex,
							},
							{
								topic: "no_one",
								message: `${this.data.name} shall pass.`,
								voiceName: "Ralph",
								secondsAfterEnd: 1,
								onStart: gandalf => gandalf.setProperty("talking", this.engine.lastTime),
								onEnd: gandalf => {
									gandalf.setProperty("talking", null);
									gandalf.setProperty("pass", true);
								},
								exit: true,								
							},
							{
								topic: "my_name",
								message: `${this.data.name}, you shall not pass.`,
								voiceName: "Ralph",
								secondsAfterEnd: 1,
								onStart: gandalf => gandalf.setProperty("talking", this.engine.lastTime),
								onEnd: gandalf => gandalf.setProperty("talking", null),
								exit: true,
							},
							{
								topic: "joker",
								message: `Ok, I'll make an exception. You shall pass.`,
								voiceName: "Ralph",
								secondsAfterEnd: 1,
								onStart: gandalf => gandalf.setProperty("talking", this.engine.lastTime),
								onEnd: gandalf => {
									gandalf.setProperty("talking", null);
									gandalf.setProperty("pass", true);
								},
								exit: true,								
							},
							{
								topic: "let_me_pass",
								message: `No.`,
								voiceName: "Ralph",
								secondsAfterEnd: 1,
								onStart: gandalf => gandalf.setProperty("talking", this.engine.lastTime),
								onEnd: gandalf => gandalf.setProperty("talking", null),
							},
							{
								message: `No one shall pass.`,
								voiceName: "Ralph",
								secondsAfterEnd: 1,
								onStart: gandalf => gandalf.setProperty("talking", this.engine.lastTime),
								onEnd: gandalf => gandalf.setProperty("talking", null),
								exit: true,
							},
							{
								topic: "let_me_pass_2",
								message: `No one shall pass.`,
								voiceName: "Ralph",
								secondsAfterEnd: 1,
								onStart: gandalf => gandalf.setProperty("talking", this.engine.lastTime),
								onEnd: gandalf => gandalf.setProperty("talking", null),
								exit: true,
							},
							{
								topic: "why",
								message: `Because...`,
								voiceName: "Ralph",
								secondsAfterEnd: 1,
								onStart: gandalf => gandalf.setProperty("talking", this.engine.lastTime),
								onEnd: gandalf => gandalf.setProperty("talking", null),
							},
							{
								message: `No one shall pass.`,
								voiceName: "Ralph",
								secondsAfterEnd: 1,
								onStart: gandalf => gandalf.setProperty("talking", this.engine.lastTime),
								onEnd: gandalf => gandalf.setProperty("talking", null),
								exit: true,
							},
						]);
					},
				},
			],
			onChange: {
				talking: (gandalf, talking) => {
					const pass = gandalf.properties.pass;
					gandalf.changeAnimation(
						pass ? (talking ? this.atlas.gandalf_pass_talk : this.atlas.gandalf_pass)
						: talking ? this.atlas.gandalf_talk : this.atlas.gandalf,
						this.engine.lastTime);
				},
				pass: (gandalf, pass) => {
					const talking = gandalf.properties.talk;
					gandalf.changeAnimation(
						pass ? (talking ? this.atlas.gandalf_pass_talk : this.atlas.gandalf_pass)
						: talking ? this.atlas.gandalf_talk : this.atlas.gandalf,
						this.engine.lastTime);
					this.savedWalkArea = null;
					this.exit.changeOpacity(pass ? 1 : 0, this.engine.lastTime);
				},
				hit: (gandalf, hit) => {
					if (hit) {
						gandalf.changeAnimation(this.atlas.gandalf_hit, this.engine.lastTime);
						this.hit.changeOpacity(1, this.engine.lastTime);
						setTimeout(() => {
							this.hit.changeOpacity(0, this.engine.lastTime);
							gandalf.setProperty("hit", null);
						}, 300);
					}
				},
			},
		});

		this.hit = this.spriteFactory.create({
			anim: this.atlas.hit,
			size: [800, 400],
			opacity: 0,
		});

		this.exit = this.spriteFactory.create({
			name: "Exit",
			anim: this.atlas.exit,
			size: [800, 400],
			opacity: 0,
		}, {
			actions: [
				{
					name: "pass",
					action: exit => {
						this.monkor.setProperty("paused", engine.lastTime);
						this.monkor.goal.x = 900;
						this.gandalf.setProperty("pass", null);
						this.butler.goal.x = 380;
						this.butler.goal.y = 300;

						this.butler.onStill = butler => {
							this.startDialog(this.gandalf, [
								{
									message: `You shall not pass.`,
									voiceName: "Ralph",
									secondsAfterEnd: 2,
									onStart: gandalf => gandalf.setProperty("talking", this.engine.lastTime),
									onEnd: gandalf => gandalf.setProperty("talking", null),
								},
								{
									message: `Oh come on! C'est Nicolas. I am the host of the impossible room.`,
									voiceName: "Thomas",
									speaker: this.butler,
									secondsAfterEnd: 2,
									onStart: gandalf => this.butler.talking = engine.lastTime,
									onEnd: gandalf => this.butler.talking = 0,
								},
								{
									message: `Just let me pass, will you?`,
									voiceName: "Thomas",
									speaker: this.butler,
									secondsAfterEnd: 2,
									onStart: gandalf => this.butler.talking = engine.lastTime,
									onEnd: gandalf => this.butler.talking = 0,
								},
								{
									message: `No one shall pass.`,
									voiceName: "Ralph",
									secondsAfterEnd: 2,
									onStart: gandalf => gandalf.setProperty("talking", this.engine.lastTime),
									onEnd: gandalf => {
										this.butler.angry = true;
										gandalf.setProperty("talking", null);
										this.butler.goal.x += 20;
									}
								},
								{
									message: `Stubborn old geezer!`,
									voiceName: "Thomas",
									speaker: this.butler,
									secondsAfterEnd: 1,
									onStart: gandalf => this.butler.talking = engine.lastTime,
									onEnd: gandalf => this.butler.talking = 0,
								},
								{
									message: `Okay, you asked for it.`,
									voiceName: "Thomas",
									speaker: this.butler,
									onStart: gandalf => this.butler.talking = this.engine.lastTime,
									onEnd: gandalf => {
										this.butler.lookRight = true;
										this.butler.talking = 0;
										setTimeout(() => {
											this.butler.kicking = this.engine.lastTime;
										}, 3000);
									},
								},
							]);
						};
					},
				},
			],
		});

		this.sceneData.monkor = this.sceneData.monkor || { x: 120, y: 350 };
		this.jokerMessage = `Hopefully, with this Joker, Gandalf will let ${me} pass.`;
	}

	onJoker(putDown) {
		if (!putDown) {
			this.gandalf.setProperty("pass", null);
		}
	}

	canPass() {
		const playerName = (this.data.name || "").toUpperCase();
		return playerName === "NO ONE" || playerName.startsWith("NO ONE ")
			|| playerName === "NOONE" || playerName.startsWith("NOONE ");
	}

	addMonkor() {
		super.addMonkor();
		const { gender } = this.data;
		const Messire = gender === "T" ? "Messires" : gender === "W" ? "Madame" : "Messire";
		const messire = gender === "T" ? "messires" : gender === "W" ? "madame" : "messire";
		const me = gender === "T" ? "us" : "me";
		const my = gender === "T" ? "our" : "my";
		const I = gender === "T" ? "We" : "I";

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
						const voiceName = "Thomas";
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
								topic: "hint",
								message: `No one can pass this room, ${messire}.`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => butler.talking = 0,
								exit: true,
							},
							{
								topic: "impossible",
								message: `No ${messire}, this is the Gandalf room.`,
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
								message: "This room is impossible because Gandalf lets no one pass.",
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
			onFrame: {
				46: butler => {
					if (butler.anim === this.atlas.butler_kick_right) {
						butler.changeAnimation(this.atlas.butler_kick_right_still, this.engine.lastTime);
					} else if (butler.anim === this.atlas.butler_kick_left) {
						butler.changeAnimation(this.atlas.butler_kick_left_still, this.engine.lastTime);
					}
				},
			},
		}, butler => {
			butler.goal = {x: butler.x, y: butler.y};
		});

		this.joker.changePosition(this.joker.x, this.joker.y - 90, engine.lastTime);
	}

	onKick(butler, time) {
		this.gandalf.setProperty("hit", time);
		this.audio.hit.play();
		this.audio.drink.play();
		setTimeout(() => {
			this.butler.goal.x = () => this.monkor.x + 50;
			this.butler.goal.y = () => this.monkor.y;
		}, 500);
		setTimeout(() => {
			this.nextLevelRight(true);
		}, 3000);
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
			} else if (this.butler.kicking) {
				const t = time - this.butler.kicking;
				const stage = t < 300 ? 1 : t < 1000 ? 2 : 3;

				if (stage === 1) {
					this.butler.changeAnimation(dx < 0 ? this.atlas.butler_kick_left : this.atlas.butler_kick_right, time);
				} else if (stage === 2) {
					this.butler.changeAnimation(dx < 0 ? this.atlas.butler_kick_left_still : this.atlas.butler_kick_right_still, time);					
					if (!this.butler.hasKicked) {
						this.butler.hasKicked = true;
						this.onKick(this.butler, time);
					}
				} else {
					this.butler.changeAnimation(dx < 0 ? this.atlas.butler_angry_left : this.atlas.butler_angry_right, time);					
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

	getWalkArea() {
		const {top, bottom, left, right} = this.backwall.getCollisionBox(engine.lastTime);
		const shift = -90;
		return {
			top: top + shift,
			bottom: bottom + shift,
			left,
			right: this.gandalf.properties.pass ? right : 450,
		};
	}

	updateGandalf(time) {
		if (this.gandalf.properties.hit && !this.gandalf.falling) {
			this.gandalf.falling = time;
			this.gandalf.dy = -20;
		}
		if (this.gandalf.falling) {
			this.gandalf.dy ++;
			this.gandalf.changePosition(this.gandalf.x + 1, this.gandalf.y + this.gandalf.dy, time);
		}
	}

	refresh(time, dt) {
		super.refresh(time, dt);
		this.updateHost(time);
		this.updateGandalf(time);
	}	

	canUseJoker() {
		return true;
	}

	openLeft() {

	}

	openRight() {
		
	}

	nextLevelLeft() {
	}

	nextLevelRight(forReal) {
		console.log("nextLevelRight()", forReal);
		if (forReal) {
			this.engine.setGame(new MathRoom());
		}
	}
}