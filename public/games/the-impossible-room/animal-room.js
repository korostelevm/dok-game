class AnimalRoom extends GameCore {
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
			letter: {},
			idols: {
				crab: await engine.addTexture({
					url: "assets/idols.png",
					collision_url: "assets/idols.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .25,
					texture_blend: "luminosity",
					cols:3,rows:4,
					range:[0],
				}),
				koala: await engine.addTexture({
					url: "assets/idols.png",
					collision_url: "assets/idols.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .25,
					texture_blend: "luminosity",
					cols:3,rows:4,
					range:[1],
				}),
				cat: await engine.addTexture({
					url: "assets/idols.png",
					collision_url: "assets/idols.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .25,
					texture_blend: "luminosity",
					cols:3,rows:4,
					range:[2],
				}),
				bird: await engine.addTexture({
					url: "assets/idols.png",
					collision_url: "assets/idols.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .25,
					texture_blend: "luminosity",
					cols:3,rows:4,
					range:[3],
				}),
				dog: await engine.addTexture({
					url: "assets/idols.png",
					collision_url: "assets/idols.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .25,
					texture_blend: "luminosity",
					cols:3,rows:4,
					range:[4],
				}),
				pig: await engine.addTexture({
					url: "assets/idols.png",
					collision_url: "assets/idols.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .25,
					texture_blend: "luminosity",
					cols:3,rows:4,
					range:[5],
				}),
				turtle: await engine.addTexture({
					url: "assets/idols.png",
					collision_url: "assets/idols.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .25,
					texture_blend: "luminosity",
					cols:3,rows:4,
					range:[6],
				}),
				horse: await engine.addTexture({
					url: "assets/idols.png",
					collision_url: "assets/idols.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .25,
					texture_blend: "luminosity",
					cols:3,rows:4,
					range:[7],
				}),
				snake: await engine.addTexture({
					url: "assets/idols.png",
					collision_url: "assets/idols.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .25,
					texture_blend: "luminosity",
					cols:3,rows:4,
					range:[8],
				}),
			},
			stand_up: await engine.addTexture({
				url: "assets/idols.png",
				collision_url: "assets/idols.png",
				texture_url: "assets/backwall.jpg",
				texture_alpha: .25,
				texture_blend: "luminosity",
				cols:3,rows:4,
				range:[9],
			}),
			stand_down: await engine.addTexture({
				url: "assets/idols.png",
				collision_url: "assets/idols.png",
				texture_url: "assets/backwall.jpg",
				texture_alpha: .25,
				texture_blend: "luminosity",
				cols:3,rows:4,
				range:[10],
			}),
		};

		for (let i = 0; i < 28; i++) {
			const letter = i === 26 ? ' ' : i == 27 ? "|" : String.fromCharCode("A".charCodeAt(0) + i);
			this.atlas.letter[letter] = await engine.addTexture(
				{
					url: "assets/letters.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .40,
					texture_blend: "source-atop",
					cols:6,rows:5,
					range:[i],
				});
		}

		this.backwall = this.spriteFactory.create({
			anim: this.atlas.backwall,
			size: [800, 400],
		});

		if (!this.properties.sentence) {
			this.setProperty("sentence", localStorage.getItem("sentence"));
		}

		if (!this.properties.sentence) {
			const idolOrder = ["cat"];
			for (let id in this.atlas.idols) {
				if (id !== "cat") {
					idolOrder.push(id);
				}
			}
			for (let i = 1; i < idolOrder.length; i++) {
				const swapI = 1 + Math.floor(Math.random() * (idolOrder.length - 1));
				const temp = idolOrder[i];
				idolOrder[i] = idolOrder[swapI];
				idolOrder[swapI] = temp;
			}
			const fiveIdols = idolOrder.slice(0, 5);
			idolOrder.unshift(idolOrder.pop());
			idolOrder.unshift(idolOrder.pop());

			let sentence = idolOrder.slice(0, 5).join(" ").toUpperCase();

			this.setProperty("sentence", sentence);
			localStorage.setItem("sentence", sentence);
		}

		//	116
		const cycle = this.properties.sentence + " ";
		for (let i = 0; i < 116; i++) {
			this.spriteFactory.create({
				anim: this.atlas.letter[cycle.charAt(i % cycle.length)],
				size: [5, 172],
				x: 110 + i * 5, y: 72,
			});
		}

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

		const Messire = gender === "T" ? "Messires" : gender === "W" ? "Madame" : "Messire";
		const messire = gender === "T" ? "messires" : gender === "W" ? "madame" : "messire";
		const I = gender === "T" ? "We" : "I";
		const me = gender === "T" ? "us" : "me";
		const my = gender === "T" ? "our" : "my";


		this.doorForwardClosed = this.spriteFactory.create({
			anim: this.atlas.right_door,
			size: [800, 400],
		});

		this.idols = {};
		let xpos = 270;
		for (let i in this.atlas.idols) {
			const name = i;
			this.idols[i] = this.spriteFactory.create({
				name,
				anim: this.atlas.idols[i],
				size: [50, 50],
				hotspot: [25, 50],
				x: xpos,
				y: 320,
				opacity: name === "cat" ? 0 : 1,
			}, {
				actions: [
					{
						name: "look",
						message: `It's an idol of a ${name}.`,
					},
					{
						name: "pick up", message: `It's pretty heavy. ${I} can only carry one at the time.`,
						condition: () => !this.itemCarried.properties.item,
						action: item => {
							item.setProperty("pickedUp", true);
							this.addToInventory(name);
							this.audio.pickup.play();
							if (!this.prettyHeavy) {
								this.prettyHeavy = true;
								this.showBubble(item.pendingMessage);
								item.pendingMessage = null;
							}
							this.itemCarried.setProperty("item", name);
						},
					},
				],
				onChange: {
					pickedUp: (item, pickedUp) => {
						item.changeOpacity(pickedUp ? 0 : 1, engine.lastTime);
					},
				},
			});
			xpos += 45;
		}

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
								message: `I believe the animals must be in the right order, ${messire}.`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => butler.talking = 0,
							},
							{
								message: `Sometimes, the solution is in plain sight.`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
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
								message: "This is called the Animal Room. A room with animal idols.",
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
								message: `You must complete this room in order to continue further to the next room, ${messire}.`,
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



		this.sceneData.monkor = this.sceneData.monkor || { x: 120, y: 350 };
	}

	isRoomSolved() {
		const idolOrder = [];
		for (let i = 0; i < 5; i++) {
			if (this.pedestalIdols[i]) {
				idolOrder.push(this.pedestalIdols[i].properties.idol);
			}
		}
		const result = idolOrder.join(" ").toUpperCase();
		return this.properties.sentence === result;
	}

	putItemBack(item) {
		const idol = this.idols[item];
		this.monkor.goal.x = idol.x;
		this.monkor.goal.y = 350;
		this.monkor.onStill = () => {
			if (Math.abs(idol.x - this.monkor.x) < 10) {
				idol.setProperty("pickedUp", false);
				this.removeFromInventory(item);
				this.itemCarried.setProperty("item", null);				
			}
		};
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
		const { gender } = this.data;
		const I = gender === "T" ? "We" : "I";
		this.itemCarried = this.spriteFactory.create({
			name: "itemCarried",
			size: [50, 50],
			hotspot: [25, 80],
			anim: this.atlas.idols.crab,
			opacity: 0,
		}, {
			onChange: {
				item: (itemCarried, item) => {
					if (!item) {
						itemCarried.changeOpacity(0, this.engine.lastTime);
					} else {
						itemCarried.changeAnimation(this.atlas.idols[item], this.engine.lastTime);
						itemCarried.changeOpacity(1, this.engine.lastTime);
					}
				},
			},
		});

		const sentence = this.properties.sentence;
		const audio = this.audio;
		const game = this;

		this.pedestals = [];
		this.pedestalIdols = [];
		let xpos = 200;
		for (let i = 0; i < 5; i++) {
			const actions = [
				{
					name: "look", condition: pedestal => !pedestal.properties.occupied,
					message: `It's a pedestal.`,
				},
			];

			for (let id in this.idols) {
				const idol = id;
				actions.push({ 
					name: () => `put ${this.itemCarried.properties.item} on pedestal`,
					condition: pedestal => (this.selectedItem === idol || this.itemCarried.properties.item === idol) && !pedestal.properties.occupied,
					item: idol,
					command: (item, target) => `put ${item.name} on the pedestal`,
					action: pedestal => {
						pedestal.setProperty("occupied", this.itemCarried.properties.item);
						this.pedestalIdols[pedestal.index].setProperty("idol", this.itemCarried.properties.item);
						this.removeFromInventory(this.itemCarried.properties.item);
						this.itemCarried.setProperty("item", null);
						this.audio.hit.play();
					},
				}, {
					name: "put down on pedestal",
					condition: pedestal => this.selectedItem === idol && pedestal.properties.occupied,
					item: idol,
					command: (item, target) => `put ${item.name} on the pedestal`,
					message: (pedestal) => `The pedestal is already occupied by a ${pedestal.properties.occupied}.`,
				});
			}

			this.pedestals[i] = this.spriteFactory.create({
				name: "pedestal #" + (i + 1),
				anim: this.atlas.stand_up,
				size: [50, 50],
				hotspot: [25, 50],
				x: xpos,
				y: 390,
			}, {
				index: i,
				actions,
				onChange: {
					occupied: (pedestal, occupied) => {
						pedestal.changeAnimation(occupied ? this.atlas.stand_down : this.atlas.stand_up, this.engine.lastTime);
					},
				},
			});

			const onChange = {
				idol: (pedestalIdol, idol) => {
					if (idol) {
						pedestalIdol.changeAnimation(this.atlas.idols[idol], this.engine.lastTime);
						pedestalIdol.changeOpacity(1, this.engine.lastTime);
					} else {
						pedestalIdol.changeOpacity(0, this.engine.lastTime);
					}
					const idolOrder = [];
					for (let i = 0; i < 5; i++) {
						if (this.pedestalIdols[i]) {
							idolOrder.push(this.pedestalIdols[i].properties.idol);
						}
					}
					const result = idolOrder.join(" ").toUpperCase();
					if (result === sentence) {
						setTimeout(() => {
							game.setRightOpened(true);
							audio.door.play();
						}, 1000);
					}
				},
			};
			this.pedestalIdols[i] = this.spriteFactory.create({
				name: item => `${item.properties.idol || "idol"} on a pedestal`,
				anim: this.atlas.idols.crab,
				size: [50, 50],
				hotspot: [25, 50],
				x: xpos,
				y: 380,
				opacity: 0,
			}, {
				index: i,
				actions: [
					{
						name: "look",
						message: item => `It's a ${item.properties.idol || "idol"} on a pedestal.`,
					},
					{
						name: "pick up", condition: pedestalIdol => pedestalIdol.index === 2,
						message: pedestalIdol => `${I} can't remove the ${pedestalIdol.properties.idol}. It's glued to the pedestal.`,
					},
					{
						name: "pick up", condition: pedestalIdol => pedestalIdol.index !== 2,
						action: pedestalIdol => {
							const { index } = pedestalIdol;
							const idol = pedestalIdol.properties.idol;
							pedestalIdol.setProperty("idol", null);
							this.pedestals[index].setProperty("occupied", null);
							this.addToInventory(idol);
							this.itemCarried.setProperty("item", idol);
							this.audio.pickup.play();
						},
					},
				],
				onChange,
			});
			if (i === 2) {
				this.pedestalIdols[i].setProperty("idol", "cat");
				this.pedestals[i].setProperty("occupied", "cat");
			}


			xpos += 100;
		}		
		this.spriteFactory.create({
			anim: this.atlas.backwallforeground,
			size: [800, 400],
		});
	}

	getWalkArea() {
		return this.backwall.getCollisionBox(engine.lastTime);		
	}

	refreshIdol(time) {
		const period = this.monkor.walking ? Math.sin(time / 30) * 2 : 0;
		this.itemCarried.changePosition(this.monkor.x, this.monkor.y + period, time);
	}

	refresh(time, dt) {
		super.refresh(time, dt);
		this.updateHost(time);
		this.refreshIdol(time);
	}	

	canUseJoker() {
		return true;
	}


	openLeft() {

	}

	setNextDoorOpened(opened) {
		this.doorForwardOpened.changeOpacity(opened?1:0, engine.lastTime);										
		this.doorForwardClosed.changeOpacity(opened?0:1, engine.lastTime);
	}

	setRightOpened(opened) {
		this.setNextDoorOpened(opened);
	}


	nextLevelLeft() {
	}

	nextLevelRight() {
		this.engine.setGame(new GandalfRoom());
	}
}