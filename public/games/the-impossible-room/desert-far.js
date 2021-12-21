class DesertFar extends GameCore {
	async init(engine, gameName) {
		await super.init(engine, gameName);

		const { config } = engine;

		/* Load Audio */
		this.audio = {
			...this.audio,
		};

		this.atlas = {
			...this.atlas,
			desert_far: await engine.addTexture({
				url: "assets/desert-far.png",
				collision_url: "assets/desert-far.png",
				cols: 2, rows: 6,
				range: [0],
			}),
			desert_far_foreground: await engine.addTexture({
				url: "assets/desert-far.png",
				cols: 2, rows: 6,
				range: [1],
			}),
			desert_far_start: await engine.addTexture({
				url: "assets/desert-far.png",
				cols: 2, rows: 6,
				range: [2,4],
				frameRate: 8,
			}),
			desert_far_end: await engine.addTexture({
				url: "assets/desert-far.png",
				cols: 2, rows: 6,
				range: [4],
			}),
			desert_map: await engine.addTexture({
				url: "assets/desert-far.png",
				collision_url: "assets/desert-far.png",
				cols: 2, rows: 6,
				range: [5],
			}),
			full_desert_map: await engine.addTexture({
				url: "assets/desert-far.png",
				collision_url: "assets/desert-far.png",
				cols: 2, rows: 6,
				range: [6],
			}),
			you_are_here: await engine.addTexture({
				url: "assets/desert-far.png",
				collision_url: "assets/desert-far.png",
				cols: 2, rows: 6,
				range: [8],
			}),
			you_are_here_lifted: await engine.addTexture({
				url: "assets/desert-far.png",
				collision_url: "assets/desert-far.png",
				cols: 2, rows: 6,
				range: [7],
			}),
			back_button: await engine.addTexture({
				url: "assets/desert-far.png",
				collision_url: "assets/desert-far.png",
				cols: 2, rows: 6,
				range: [9],
			}),
			chain: await engine.addTexture({
				url: "assets/desert-far.png",
				collision_url: "assets/desert-far.png",
				cols: 2, rows: 6,
				range: [10],
			}),
			desert_wall: await engine.addTexture({
				url: "assets/desert-room.png",
				collision_url: "assets/desert-room-collision.png",
				cols: 1, rows: 4,
				range: [1],
			}),
			desert_skull: await engine.addTexture({
				url: "assets/desert-far.png",
				collision_url: "assets/desert-far.png",
				cols: 2, rows: 6,
				range: [11],
			}),
		};

		this.backwall = this.spriteFactory.create({
			anim: this.atlas.desert_wall,
			size: [800, 400],
			opacity: 0,
		});

		const [viewportWidth, viewportHeight] = config.viewport.size;
		this.desert_far = this.spriteFactory.create({
			name: "desert",
			anim: this.atlas.desert_far,
			size: [800, 400],
			hotspot: [400, 200],
			x: 400, y: 200,
		}, {
			actions: [
				{ name: "walk west",
					action: action => {
						this.walkTo(-100, 350, "W");
					},
				},
				{ name: "walk north",
					action: action => {
						this.walkTo(400, 270, "N");
					},
				},
				{ name: "walk south",
					action: action => {
						this.walkTo(400, 500, "S");
					},
				},
				{ name: "walk east",
					action: action => {
						this.walkTo(900, 350, "E");
					},
				},
			],
		});
		this.desert_far_start = this.spriteFactory.create({
			anim: this.atlas.desert_far,
			size: [800, 400],
			hotspot: [400, 200],
			x: 400, y: 200,
		}, 		
		{
			onFrame: {
				4: desert_far_start => {
					desert_far_start.changeAnimation(this.atlas.desert_far_end, this.engine.lastTime);
				},
			},
		});
		setTimeout(() => {
			this.audio.drink.play();
			this.desert_far_start.changeAnimation(this.atlas.desert_far_start, this.engine.lastTime);
			this.pop_out.dy = 10;
			this.pop_out.changeOpacity(1, this.engine.lastTime);
		}, 5000);

		this.chain = this.spriteFactory.create({
			name: "chain",
			anim: this.atlas.chain,
			size: [800, 400],
			opacity: 0,
		}, {
			actions: [
				{
					name: "climb",
					action: () => {
						this.monkor.paused = true;
						this.monkor.goal.x = 400 + this.chain.x;
						this.monkor.goal.y = -100;
						this.monkor.onStill = () => {
							this.achieve("The Desert", "DesertRoom");
							// getMedal("The Desert", this.onUnlockMedal);
							this.engine.setGame(new DesertExit());
						};
					},
				},
			],
		});

		this.pop_out = this.spriteFactory.create({
			anim: this.atlas.monkor_still,
			size: [64, 64],
			x: 350, y: 0,
			opacity: 0,
		}, {
			dx: 0, dy: 0,
		});
		this.desert_map = this.spriteFactory.create({
			name: "map",
			anim: this.atlas.desert_map,
			size: [800, 400],
			y: 45,
			opacity: 0,
		}, {
			actions: [
				{ name: "look",
					message: () => `It's a map of the desert!`,
					 lookup: 500,
				},
				{ name: "view", lookup: 1000,
					action: () => this.viewMap(this.engine.lastTime),
				},
			],
		});

		const { gender } = this.data;
		const I = gender === "T" ? "We" : "I";
		const me = gender === "T" ? "us" : "me";
		const my = gender === "T" ? "our" : "my";

		const Iam = gender === "T" ? "We are" : "I am";
		const amI = gender === "T" ? "are we" : "am I";
		const moreHints = [
			"",
			`${I} think the map indicates where ${Iam}, which is in the middle of the desert. Thank you Skull.`,
			`Can ${I} use the map to change ${my} location? I wonder Skull.`,
			`Really, ${I} am still stuck? Why won't you help ${me} Skull? Why?!?!`,
		];


		this.desert_skull = this.spriteFactory.create({
			name: "skull",
			anim: this.atlas.desert_skull,
			size: [400, 200],
			x: 350, y: 150,
			opacity: 0,
		}, {
			actions: [
				{ name: "look",
					message: () => `It's a skull in the middle of the desert!`,
				},
				{ name: "talk",
					action: () => {
						this.startDialog(this.monkor, [
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
									},
								],
							},
							{
								message: `Why ${amI} talking to a dead skull?`,
								exit: true,
							},
							{
								topic: "hint",
								message: `I guess ${I} should check out the map. Don't you think so Skull?`,
								onEnd: butler => {
									if (this.allowExtraHints()) {
										this.hintIndex = ((this.hintIndex || 0) + 1) % moreHints.length;
									}
								},
								exit: true,
							},
							{
								topic: "more_hint",
								message: () => moreHints[this.hintIndex],
								onEnd: butler => {
									this.hintIndex = ((this.hintIndex || 0) + 1) % moreHints.length;
								},
								exit: true,
							},
							{
								topic: "unwanted-item",
								message: `The skull doesn't want it.`,
								next: previousIndex => previousIndex,
							},
							{
								topic: "impossible",
								message: `Probably not.`,
							},
						]);
					},
				},
			],
		});

		this.removeFromInventory("note");
	}

	addMonkor() {
		super.addMonkor();
		const { gender } = this.data;

		const Iam = gender === "T" ? "We are" : "I am";


		this.full_desert_map = this.spriteFactory.create({
			name: "map",
			anim: this.atlas.full_desert_map,
			size: [800, 400],
			opacity: 0,
		}, {
			reachable: true,
			actions: [
				{
					name: "look", message: `The map shows where ${Iam}.`,
				},
			],
		});

		this.back_button = this.spriteFactory.create({
			name: "back",
			anim: this.atlas.back_button,
			size: [800, 400],
			opacity: 0,
		}, {
			reachable: true,
			onMouseDown: () => {
				this.hideMap(this.engine.lastTime);
			},
		});

		this.you_are_here = this.spriteFactory.create({
			name: "you are here",
			anim: this.atlas.you_are_here,
			size: [800, 400],
			opacity: 0,
		}, {
			reachable: true,
			actions: [
				{
					name: "look", message: `${Iam} here.`,
				},
			],
			onMouseDown: (you_are_here, e) => {
				you_are_here.changeAnimation(this.atlas.you_are_here_lifted, this.engine.lastTime);

				const { canvas } = this.engine;
				const { pageX, pageY, buttons } = e;
				const rect = canvas.getBoundingClientRect();
				const x = (pageX - rect.x) / rect.width * canvas.offsetWidth,
					  y = (pageY - rect.y) / rect.height * canvas.offsetHeight;

				you_are_here.lastLift = {
					x,
					y,
				};
			},
		});
	}

	onMouseMove(e) {
		const { you_are_here } = this;
		if (you_are_here.anim === this.atlas.you_are_here_lifted) {
			const { canvas } = this.engine;
			const { pageX, pageY, buttons } = e;
			const rect = canvas.getBoundingClientRect();
			const x = (pageX - rect.x) / rect.width * canvas.offsetWidth,
				  y = (pageY - rect.y) / rect.height * canvas.offsetHeight;

			const dx = x - you_are_here.lastLift.x;
			const dy = y - you_are_here.lastLift.y;

			you_are_here.changePosition(
				Math.min(257, Math.max(-332, you_are_here.x + dx)),
				Math.min(77, Math.max(-130, you_are_here.y + dy)),
				you_are_here.z,
				this.engine.lastTime);

			if (this.you_are_here.x >= 225 && this.you_are_here.y < -120) {
				this.showChain(286 - this.you_are_here.x, -120 - this.you_are_here.y, this.engine.lastTime);
			} else if (this.you_are_here.x <= -226 && this.you_are_here.y < -120) {
				this.showChain(- 286 - this.you_are_here.x, -120 - this.you_are_here.y, this.engine.lastTime);
			} else {
				this.hideChain(this.engine.lastTime);
			}

			you_are_here.lastLift.x = x;
			you_are_here.lastLift.y = y;
		}
	}

	onMouseUp() {
		if (this.you_are_here.anim === this.atlas.you_are_here_lifted) {
			this.you_are_here.changeAnimation(this.atlas.you_are_here, this.engine.lastTime);		
		}
	}

	showChain(x, y, time) {
		this.chain.changeOpacity(1, time);
		this.chain.changePosition(x * 10, this.chain.y, this.chain.z, time);
	}

	hideChain(time) {
		this.chain.changeOpacity(0, time);
	}

	canRunLeft() {
		return true;
	}

	runAwayToPreviousRoom() {
		return true;
	}

	shouldPutBack() {
		return true;
	}

	nextLevelLeft()	{
		this.monkor.changeOpacity(0, this.engine.lastTime);
		setTimeout(() => {
			this.startShrink = this.engine.lastTime;
			this.desert_far.previousShrinkValue = 1;
			this.nextScene = "W";
		}, 1000);
	}

	viewMap(time) {
		this.full_desert_map.changeOpacity(1, time);
		this.you_are_here.changeOpacity(1, time);
		this.back_button.changeOpacity(1, time);
		this.monkor.busy = true;
	}

	hideMap(time) {
		this.full_desert_map.changeOpacity(0, time);
		this.you_are_here.changeOpacity(0, time);
		this.back_button.changeOpacity(0, time);
		this.monkor.busy = false;
	}

	walkTo(x, y, exitLabel) {
		this.monkor.setProperty("paused", this.engine.lastTime);
		this.monkor.goal.x = x;
		this.monkor.goal.y = y;
		this.monkor.onStill = monkor => {
			monkor.changeOpacity(0, this.engine.lastTime);
			setTimeout(() => {
				this.startShrink = this.engine.lastTime;
				this.desert_far.previousShrinkValue = 1;
				this.nextScene = exitLabel;
			}, 1000);
		};
	}

	refresh(time, dt) {
		super.refresh(time, dt);
		if (!this.flipped) {
			this.pop_out.changePosition(
				this.pop_out.x + this.pop_out.dx,
				this.pop_out.y + this.pop_out.dy,
				this.pop_out.z,
				time);
			if (this.pop_out.y >= 50) {
				this.pop_out.dy -= .5;
			} else if (this.pop_out.dy < 0) {
				this.pop_out.dy = 0;
				this.pop_out.changeVDirection(-1, time);
				setTimeout(() => {
					this.startShrink = this.engine.lastTime;
				}, 3000);
			}
		}

		if (this.startShrink) {
			this.desert_far_start.changeOpacity(0, time);
			this.pop_out.changeOpacity(0, time);
			this.desert_far_foreground.changeOpacity(0, time);
			this.desert_map.changeOpacity(0, time);
			const t = time - this.startShrink;
			const shrinkValue = Math.max(-1, (500 - t) / 500);
			this.desert_far.changeSize(800, 400 * Math.abs(shrinkValue), time);
			this.desert_far.changeHotSpot(400, 200 * Math.abs(shrinkValue), time);
			this.desert_far.changeVDirection(this.nextScene || shrinkValue < 0 ? -1 : 1, time);
			if (this.nextScene && shrinkValue * this.desert_far.previousShrinkValue < 0) {
				this.desert_far.changeDirection(-this.desert_far.direction, time);				
			}

			this.desert_far.previousShrinkValue = shrinkValue;

			if (shrinkValue === -1) {
				this.startShrink = 0;
				this.flipped = true;
				this.monkor.setProperty("paused", false);
				this.monkor.changeOpacity(1, time);
				this.monkor.changeSize(64, 64, time);
				this.monkor.changeHotSpot(32, 64, time);
				this.monkor.changePosition(390, 350, this.monkor.z, time);
				this.savedWalkArea = null;

				if (this.nextScene) {
					switch(this.nextScene) {
						case "N": 
							this.monkor.changePosition(390, 430, this.monkor.z, time);
							break;
						case "S":
							this.monkor.changePosition(390, 270, this.monkor.z, time);
							break;
						case "E":
							this.monkor.changePosition(100, 350, this.monkor.z, time);
							break;							
						case "W":
							this.monkor.changePosition(700, 350, this.monkor.z, time);
							break;							
					}
					this.changedSceneCount = (this.changedSceneCount||0) + 1;
					if (this.changedSceneCount >= 3) {
						this.changedSceneCount = 0;
						this.desert_map.changeOpacity(1, time);
						this.desert_skull.changeOpacity(1, time);
					} else {
						this.desert_map.changeOpacity(0, time);
						this.desert_skull.changeOpacity(0, time);						
					}
				} else {
					const { gender } = this.data;
					const I = gender === "T" ? "We" : "I";
					this.monkor.setProperty("paused", true);
					this.showBubble(`Incredible. ${I} landed in the middle of the desert.`, () => {
						this.monkor.setProperty("paused", false);
					});
				}

				this.monkor.goal.x = this.monkor.x;
				this.monkor.goal.y = this.monkor.y;
			}
		}
	}

	getWalkArea() {
		return !this.flipped ? {} : this.backwall.getCollisionBox(engine.lastTime);		
	}

	async postInit() {
		super.postInit();
		this.desert_far_foreground = this.spriteFactory.create({
			anim: this.atlas.desert_far_foreground,
			size: [800, 400],
		});
		this.monkor.changeOpacity(0, this.engine.lastTime);
		this.monkor.setProperty("paused", true);
	}
}