class DesertExit extends RoomBase {
	async init(engine, coreName) {
		await super.init(engine, coreName);

		const { gl, config } = engine;
		const { gender } = this.data;

		/* Load Audio */
		this.audio = {
			...this.audio,
		};

		this.atlas = {
			...this.atlas,
			out_chain_foreground: await engine.addTexture({
				url: "assets/out-chain.png",
				cols: 1, rows: 2,
				range: [0],
				texture_url: "assets/backwall.jpg",
				texture_alpha: .15,
				texture_blend: "source-atop",
			}),
			out_chain: await engine.addTexture({
				url: "assets/out-chain.png",
				cols: 1, rows: 2,
				range: [1],
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

		this.spriteFactory.create({
			anim: this.atlas.out_chain,
			size: [800, 400],
		});

		this.butler = this.spriteFactory.create({
			name: "Nicolas",
			anim: this.atlas.butler,
			x: 200, y: 340,
			size: [96,192],
		}, {
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
		super.addMonkor();

		const { gender } = this.data;
		const messire = gender === "T" ? "messires" : gender === "W" ? "madame" : "messire";

		this.spriteFactory.create({
			anim: this.atlas.backwallforeground,
			size: [800, 400],
		});
		const foreChain = this.spriteFactory.create({
			anim: this.atlas.out_chain_foreground,
			size: [800, 400],
		});
		if (this.isFirstTime()) {
			this.monkor.changePosition(400, 500, this.monkor.z, this.engine.lastTime);
			this.monkor.setProperty("paused", true);
			this.monkor.goal.x = this.monkor.x;
			this.monkor.goal.y = 360;
			this.monkor.onStill = () => {
				foreChain.changeOpacity(0, this.engine.lastTime);
				this.monkor.goal.y = 380;
				this.monkor.onStill = () => {
					this.butler.talking = true;
					this.showBubble(`Ah, there you are, ${messire}.`, () => {
						this.butler.talking = false;
						setTimeout(() => {
							this.butler.talking = true;
							this.showBubble(`Glad you made it.`, () => {
								this.butler.talking = false;
								this.monkor.setProperty("paused", false);
							}, "Thomas", this.butler);
						}, 2000);
					}, "Thomas", this.butler);				
				};
			};
		} else {
			foreChain.changeOpacity(0, this.engine.lastTime);
			this.monkor.goal.x = this.monkor.x;
			this.monkor.goal.y = this.monkor.y;
		}
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
		this.updateHost(time);
	}	

	openLeft() {

	}

	openRight() {
		
	}

	nextLevelLeft() {
	}

	nextLevelRight() {
		this.engine.setGame(new BatmanRoom());
	}
}