class Mall extends RoomBase {
	async init(engine, gameName) {
		await super.init(engine, gameName);

		const { gl, config } = engine;
		const { gender } = this.data;

		const person2Gender = gender !== "W" ? "W" : "M";
		const person2Url = person2Gender === "M" ? "assets/monkor.png" : "assets/nuna.png";
		const person3Gender = gender !== "T" ? "T" : "M";
		const person3Url = person3Gender === "M" ? "assets/monkor.png" : "assets/twin.png";
		this.person2Gender = person2Gender;
		this.person3Gender = person3Gender;


		/* Load Audio */
		this.audio = {
			...this.audio,
		};

		this.atlas = {
			...this.atlas,
			mall: await engine.addTexture({
				url: "assets/mall.png",
				texture_url: "assets/backwall.jpg",
				texture_alpha: .25,
				texture_blend: "luminosity",
			}),
			title: await engine.addTexture({
				url: "assets/title.png",
				texture_url: "assets/backwall.jpg",
				texture_opacity: .2,
			}),
			person2_still: await engine.addTexture(
				{
					url: person2Url,
					cols: 5,
					rows: 5,
					hotspot: Constants.HOTSPOT_BOTTOM,
				}),
			person3_still: await engine.addTexture(
				{
					url: person3Url,
					cols: person3Gender === "T" ? 6 : 5,
					rows: person3Gender === "T" ? 6 : 5,
					hotspot: Constants.HOTSPOT_BOTTOM,
				}),
			person2_talk: await engine.addTexture(
				{
					url: person2Url,
					cols: 5,
					rows: 5,
					frameRate:10,
					range: person2Gender==="T" ? [21, 25] : [13, 16],
					hotspot: Constants.HOTSPOT_BOTTOM,
				}),
			person2_walk_right: await engine.addTexture(
				{
					url: person2Url,
					cols: 5,
					rows: 5,
					frameRate:10,
					range: person2Gender === 'T' ? [9, 12] : [9, 12],
					hotspot: Constants.HOTSPOT_BOTTOM,
				}),
			person3_talk: await engine.addTexture(
				{
					url: person3Url,
					cols: person3Gender === "T" ? 6 : 5,
					rows: person3Gender === "T" ? 6 : 5,
					frameRate:10,
					range: person3Gender==="T" ? [21, 25] : [13, 16],
					hotspot: Constants.HOTSPOT_BOTTOM,
				}),
			person3_walk_right: await engine.addTexture(
				{
					url: person3Url,
					cols: person3Gender === "T" ? 6 : 5,
					rows: person3Gender === "T" ? 6 : 5,
					frameRate:10,
					range: person3Gender === 'T' ? [9, 12] : [9, 12],
					hotspot: Constants.HOTSPOT_BOTTOM,
				}),
			backwall: await engine.addTexture({
				url: "assets/backwall.jpg",
			}),
			itchio: await engine.addTexture({
				url: "assets/logos.png",
				collision_url: "assets/logos.png",
				cols: 2, rows: 3,
				range: [4],
				hotspot: Constants.HOTSPOT_CENTER,
			}),
			ng: await engine.addTexture({
				url: "assets/logos.png",
				collision_url: "assets/logos.png",
				cols: 2, rows: 3,
				range: [0],
				hotspot: Constants.HOTSPOT_CENTER,
			}),
			twitter: await engine.addTexture({
				url: "assets/logos.png",
				collision_url: "assets/logos.png",
				cols: 2, rows: 3,
				range: [1],
				hotspot: Constants.HOTSPOT_CENTER,
			}),
			youtube: await engine.addTexture({
				url: "assets/logos.png",
				collision_url: "assets/logos.png",
				cols: 2, rows: 3,
				range: [2],
				hotspot: Constants.HOTSPOT_CENTER,
			}),
			github: await engine.addTexture({
				url: "assets/logos.png",
				collision_url: "assets/logos.png",
				cols: 2, rows: 3,
				range: [3],
				hotspot: Constants.HOTSPOT_CENTER,
			}),
		};
		this.backwall = this.spriteFactory.create({
			anim: this.atlas.backwall,
			size: [800, 400],
			opacity: .2,
		});

		this.mall = this.spriteFactory.create({
			anim: this.atlas.mall,
			size: [800, 400],
			opacity: .9,
		});

		this.person2 = this.spriteFactory.create({
			x: 310, y: 340,
			size: [128, 128],
			anim: this.atlas.person2_still,
		});
		this.person3 = this.spriteFactory.create({
			x: 400, y: 360,
			size: [128, 128],
			anim: this.atlas.person3_still,
		});
		this.removeFromInventory("note");
	}

	refreshPerson2(time) {
		if (this.person2.walkRight) {
			this.person2.changeAnimation(this.atlas.person2_walk_right, time);
			this.person2.changePosition(this.person2.x + .6, this.person2.y, this.person2.z, time);
		} else if (this.person2.talking) {
			this.person2.changeAnimation(this.atlas.person2_talk, time);
		} else {
			this.person2.changeAnimation(this.atlas.person2_still, time);			
		}
	}

	refreshPerson3(time) {
		if (this.person3.walkRight) {
			this.person3.changeAnimation(this.atlas.person3_walk_right, time);
			this.person3.changePosition(this.person3.x + 1, this.person3.y, this.person3.z, time);
		} else if (this.person3.talking) {
			this.person3.changeAnimation(this.atlas.person3_talk, time);
		} else {
			this.person3.changeAnimation(this.atlas.person3_still, time);			
		}
	}

	addMonkor() {
		super.addMonkor();
		this.monkor.changePosition(-1500, 373, this.monkor.z, this.engine.lastTime);
		this.monkor.goal.x = 223;
		this.monkor.goal.y = 375;
		const { config, viewportWidth, viewportHeight } = this.engine;

		this.title = this.spriteFactory.create({
			anim: this.atlas.title,
			x: viewportWidth / 2 - 350,
			y: viewportHeight / 2 - 40,
			size: [700, 80],
			opacity: 0,
		});

		this.ng = this.spriteFactory.create({
			x: 100, y: 350,
			size: [64, 64],
			anim: this.atlas.ng,
//			opacity: 0,
		}, {
			reachable: true,
			onMouseDown: () => {
				window.open("https://jacklehamster.newgrounds.com", '_blank');
			},
		});
		this.itchio = this.spriteFactory.create({
			x: 700, y: 350,
			size: [64, 64],
			anim: this.atlas.itchio,
//			opacity: 0,
		}, {
			reachable: true,
			onMouseDown: () => {
				window.open("https://jacklehamster.itch.io", '_blank');
			},
		});
		//https://www.flaticon.com/free-icon/twitter_124021
		this.twitter = this.spriteFactory.create({
			x: 250, y: 350,
			size: [64, 64],
			anim: this.atlas.twitter,
//			opacity: 0,
		}, {
			reachable: true,
			onMouseDown: () => {
				window.open("https://twitter.com/jacklehamster", '_blank');
			},
		});
		this.youtube = this.spriteFactory.create({
			x: 550, y: 350,
			size: [64, 64],
			anim: this.atlas.youtube,
//			opacity: 0,
		}, {
			reachable: true,
			onMouseDown: () => {
				window.open("https://www.youtube.com/user/vincentlequang2", '_blank');
			},
		});
		this.github = this.spriteFactory.create({
			x: 400, y: 350,
			size: [64, 64],
			anim: this.atlas.github,
//			opacity: 0,
		}, {
			reachable: true,
			onMouseDown: () => {
				window.open("https://github.com/jacklehamster", '_blank');
			},
		});
		this.socialMediaButtons = [
			this.ng, this.itchio, this.youtube, this.twitter, this.github,
		];
		this.socialMediaButtons.forEach(button => button.changeOpacity(0, this.engine.lastTime));



//		https://github.com/jacklehamster
	}

	refresh(time, dt) {
		super.refresh(time, dt);
		this.refreshPerson2(time);
		this.refreshPerson3(time);

		if (this.fadeStart) {
			const { config, viewportWidth, viewportHeight } = this.engine;
			const timeDiff = (time - this.fadeStart);
			const log = Math.log(timeDiff) / 10;

			const totalTime = 10000;
			const width = 700 * log;
			const height = 80 * log;
			const opacityOut = Math.max(0, (totalTime - timeDiff) / 2000);
			const opacity = Math.min(1, Math.min(1, timeDiff / 5000));
			const x = viewportWidth / 2 - width / 2;
			const y = viewportHeight / 2 - height / 2;
			this.title.changePosition(x, y, this.title.z, time);
			this.title.changeSize(width, height, time);
			this.title.changeOpacity(opacity, time);
			this.mall.changeOpacity(opacityOut, time);
		}
	}

	async postInit() {
		await super.postInit();
		this.setSFX(true, true);
		const audio = await this.engine.music.getAudio("music/weirdsong.mp3");
		audio.currentTime = 0;
		this.setAudio(audio, true, .15, true);

		const { gender } = this.data;
		const genderToVoice = {
			M: "Daniel",
			W: "Karen",
			T: "Alex",
		};

		const voiceName2 = genderToVoice[this.person2Gender];
		const voiceName3 = genderToVoice[this.person3Gender];

		this.monkor.setProperty("paused", true);
		this.monkor.bubbleTop = 20;

		const { person2, person3 } = this;

		const I = gender === "T" ? "We" : "I";
		const was = gender === "T" ? "were" : "was";
		const me = gender === "T" ? "us" : "me";
		const him = gender === "T" ? "them": gender === "W" ? "her" : "him";

		setTimeout(() => {
			this.processDialog([
				{
					person: person2, voice: voiceName2, delay: 1500,
					msg: `Damn it, what's taking ${him} so long?`,
				},
			]);
		}, 3000);

		this.monkor.onStill = () => {
			this.person2.changeDirection(-1, this.engine.lastTime);
			this.processDialog([
				{
					person: person2, voice: voiceName2, delay: 1000,
					msg: `Ah, there you are! Where the hell were you?`,
				},
				{
					person: this.monkor, voice: null, delay: 1000,
					msg: `${I} ${was} playing a game. It's called the Impossible Room.`,				
				},
				{
					person: this.monkor, voice: null, delay: 1000,
					msg: `${I} managed to escape by outsmarting the host, Nicolas Debossin.`,				
				},
				{
					person: person2, voice: voiceName2, delay: 1000,
					msg: `That sounds like a big waste of time.`,
				},
				{
					person: person2, voice: voiceName2, delay: 1000,
					msg: `Can we go grab something to eat now?.`,
				},
				{
					person: this.monkor, voice: null, delay: 1000,
					msg: `Sure, let's go have lunch together.`,				
				},
				{
					person: person3, voice: voiceName3, delay: 1000,
					msg: `Can we try the Impossible Burger?`,
					onEnd: person => {
						this.person2.walkRight = true;
						this.person2.changeDirection(1, this.engine.lastTime);
						this.setAudio(audio, true, .2, true);
					},
				},
				{
					person: this.monkor, voice: null, delay: 1000,
					msg: `Oh, trust ${me}. It's not worth it.`,				
					onEnd: person => {
						setTimeout(() => {
							person3.walkRight = true;
							person3.changeDirection(1, this.engine.lastTime);
							this.setAudio(audio, true, .5, true);
						}, 1000);
						setTimeout(() => {
							this.monkor.goal.x = 1000;
							this.fadeStart = this.engine.lastTime;
							this.showThankYou();
							this.monkor.setProperty("paused", false);
							setTimeout(() => {
								this.socialMediaButtons.forEach(button => button.changeOpacity(1, this.engine.lastTime));
							}, 10000);
						}, 3000);
					},
				},
			]);			
		};
	}

	showThankYou() {
		const thankYouDiv = document.getElementById("thank-you") || document.getElementById("container").appendChild(document.createElement("div"));
		thankYouDiv.id = "thank-you";
		thankYouDiv.style.position = "absolute";
		thankYouDiv.style.top = "130px";
		thankYouDiv.style.left = "310px";
		thankYouDiv.style.zIndex = 300;
		thankYouDiv.style.display = "";
		thankYouDiv.innerText = "";

		const img = thankYouDiv.appendChild(document.createElement("img"));
		img.src = "assets/thank-you.gif";
	}

	processDialog(dialogArray, index) {
		if (!index) {
			index = 0;
		}
		const { person, voice, msg, delay, onEnd } = dialogArray[index];

		if (person) {
			person.talking = this.engine.lastTime;
		}
		this.showBubble(typeof(msg) === "function" ? msg(person) : msg, () => {
			if (person) {
				person.talking = 0;
			}
			if (onEnd) {
				onEnd(person);
			}
			if (index < dialogArray.length - 1) {
				setTimeout(() => {
					this.processDialog(dialogArray, index + 1);
				}, delay || 0);
			}
		}, voice, person);

	}

	async onExit(engine) {
		if (document.getElementById("thank-you")) {
			document.getElementById("container").removeChild(document.getElementById("thank-you"));
		}
		return await super.onExit(engine);
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