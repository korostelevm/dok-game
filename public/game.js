class Game extends GameCore {
	constructor() {
		super();
		const imageLoader = new ImageLoader();
		imageLoader.preloadImages(
			"assets/background-door.png",
			"assets/background-door-collision.png",
			"assets/sign.png",
			"assets/smoking-sign.png",
			"assets/piano.png",
			"assets/mouse.png",
			"assets/mat.png",
			"assets/mat-collision.png",
			"assets/monkor.png",
			"assets/monkor-collision.png",
			"assets/skin-texture.jpg",
			"assets/backwall.jpg",
		);

		document.addEventListener("DOMContentLoaded", () => {
			engine.setGame(this);
		});
	}

	async init(engine) {
		await super.init(engine);
		this.engine = engine;

		const { gl, config } = engine;

		engine.chrono.tick("game init start.");

		/* Load image */
		this.atlas = {
			entrance: await engine.textureManager.createAtlas(1).setImage(
				{
					url: "assets/background-door.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .25,
					texture_blend: "luminosity",
					cols:2,rows:4,
					collision_url: "assets/background-door-collision.png",
					range:[0],
				}),
			entrance_open: await engine.textureManager.createAtlas(1).setImage(
				{
					url: "assets/background-door.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .25,
					texture_blend: "luminosity",
					cols:2,rows:4,
					collision_url: "assets/background-door-collision.png",
					frameRate: 10,
					range:[4,6],
				}),
			entrance_opened: await engine.textureManager.createAtlas(1).setImage(
				{
					url: "assets/background-door.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .25,
					texture_blend: "luminosity",
					cols:2,rows:4,
					collision_url: "assets/background-door-collision.png",
					range:[6],
				}),
			sign: await engine.textureManager.createAtlas(3).setImage(
				{
					url: "assets/sign.png",
					collision_url: "assets/sign.png",
				}),
			smokingsign: await engine.textureManager.createAtlas(4).setImage(
				{
					url: "assets/smoking-sign.png",
					collision_url: "assets/smoking-sign.png",
				}),
			cigarette: await engine.textureManager.createAtlas(5).setImage(
				{
					url: "assets/cigarette.png",
					collision_url: "assets/cigarette.png",
				}),
			piano: await engine.textureManager.createAtlas(6).setImage(
				{
					url: "assets/piano.png",
					cols:1,rows:2,
					range:[0],
				}),
			piano_splash: await engine.textureManager.createAtlas(6).setImage(
				{
					url: "assets/piano.png",
					cols:1,rows:2,
					range:[1],
				}),
			mouse: await engine.textureManager.createAtlas(7).setImage(
				{
					url: "assets/mouse.png",
					cols:2,rows:2,
					range:[0],
				}),
			mouse_run: await engine.textureManager.createAtlas(7).setImage(
				{
					url: "assets/mouse.png",
					cols:2,rows:2,
					frameRate: 20,
					range:[1, 2],
				}),
			mat: await engine.textureManager.createAtlas(2).setImage(
				{
					url: "assets/mat.png",
					texture_url: "assets/skin-texture.jpg",
					texture_alpha: .3,
					cols:2,rows:4,
					collision_url: "assets/mat-collision.png",
					range:[0],
				}),
			mat_pulling: await engine.textureManager.createAtlas(2).setImage(
				{
					url: "assets/mat.png",
					texture_url: "assets/skin-texture.jpg",
					texture_alpha: .3,
					cols:2,rows:4,
					collision_url: "assets/mat-collision.png",
					frameRate: 4,
					range:[1, 2],
				}),
			mat_pulled: await engine.textureManager.createAtlas(2).setImage(
				{
					url: "assets/mat.png",
					texture_url: "assets/skin-texture.jpg",
					texture_alpha: .3,
					cols:2,rows:4,
					collision_url: "assets/mat-collision.png",
					range:[2],
				}),
			mat_picked_key: await engine.textureManager.createAtlas(2).setImage(
				{
					url: "assets/mat.png",
					texture_url: "assets/skin-texture.jpg",
					texture_alpha: .3,
					cols:2,rows:4,
					collision_url: "assets/mat-collision.png",
					range:[3],
				}),
			monkor_still: await engine.textureManager.createAtlas(0).setImage(
				{
					url: "assets/monkor.png",
					collision_url: "assets/monkor-collision.png",
					// texture_url: "assets/skin-texture.jpg",
					// texture_alpha: .15,
					cols:5,rows:5,
					range:[0],
				}),
			monkor_front: await engine.textureManager.createAtlas(0).setImage(
				{
					url: "assets/monkor.png",
					// texture_url: "assets/skin-texture.jpg",
					// texture_alpha: .15,
					cols:5,rows:5,
					frameRate:10,
					range:[1, 4],
				}),
			monkor_back: await engine.textureManager.createAtlas(0).setImage(
				{
					url: "assets/monkor.png",
					// texture_url: "assets/skin-texture.jpg",
					// texture_alpha: .15,
					cols:5,rows:5,
					frameRate:10,
					range:[5, 8],
				}),
			monkor_right: await engine.textureManager.createAtlas(0).setImage(
				{
					url: "assets/monkor.png",
					// texture_url: "assets/skin-texture.jpg",
					// texture_alpha: .15,
					cols:5,rows:5,
					frameRate:10,
					range:[9, 12],
				}),
			monkor_talk: await engine.textureManager.createAtlas(0).setImage(
				{
					url: "assets/monkor.png",
					// texture_url: "assets/skin-texture.jpg",
					// texture_alpha: .15,
					cols:5,rows:5,
					frameRate:10,
					range:[13, 16],
				}),
			monkor_smoke: await engine.textureManager.createAtlas(0).setImage(
				{
					url: "assets/monkor.png",
					// texture_url: "assets/skin-texture.jpg",
					// texture_alpha: .15,
					cols:5,rows:5,
					frameRate:8,
					range:[17, 19],
				}),
			monkor_puff: await engine.textureManager.createAtlas(0).setImage(
				{
					url: "assets/monkor.png",
					// texture_url: "assets/skin-texture.jpg",
					// texture_alpha: .15,
					cols:5,rows:5,
					range:[20],
				}),
			monkor_scared: await engine.textureManager.createAtlas(0).setImage(
				{
					url: "assets/monkor.png",
					// texture_url: "assets/skin-texture.jpg",
					// texture_alpha: .15,
					cols:5,rows:5,
					range:[21],
				}),
			monkor_run: await engine.textureManager.createAtlas(0).setImage(
				{
					url: "assets/monkor.png",
					// texture_url: "assets/skin-texture.jpg",
					// texture_alpha: .15,
					cols:5,rows:5,
					frameRate:10,
					range:[21, 24],
				}),
		};
		engine.chrono.tick("done creating atlas");

		const [viewportWidth, viewportHeight] = config.viewport.size;


		this.inventory = [];

		this.inventoryDetails = {
			key: {
				actions: [
					{ name: "look", message: () => "I picked up some keys that didn't belong to me from under a mat." },
					{ name: "eat", message: () => "I swallowed the key. Now, this game is truly IMPOSSIBLE!.", 
						action: key => {
							this.inventory.remove("key");
							this.updateInventory();
							engine.playAudio("audio/eat.mp3", .5);
							this.showBubble(key.pendingMessage);
							key.pendingMessage = null;
							setTimeout(() => this.gameOver(), 6000);					
						},
					},
				],
			},
			cigarette: {
				actions: [
					{ name: "look", message: () => "It's a cigarette butt. I'm not a regular smoker, but I don't think it will kill me." },
					{ name: "smoke", message: () => "Let me take a puff of that cigarette.",
						action: item => {
							this.showBubble(item.pendingMessage, () => {
								this.monkor.smoking = engine.lastTime;
								this.monkor.paused = engine.lastTime;
							});
							item.pendingMessage = null;
						},
					},
				],
			},
			title: {
				actions: [
					{ name: "look", message: () => `${document.getElementById("title").innerText}` },
				],
			},
		};

		for (let name in this.inventoryDetails) {
			this.inventoryDetails[name].name = name;
		}

		engine.spriteCollection.create({
			name: "entrance",
			anim: this.atlas.entrance,
			size: [800, 400],
		}, {
			actions: [
				{ name: "look", condition: entrance => !entrance.opened, message: () => `There's a door, that leads to ${this.title.innerText}` },
				{ name: "open", condition: entrance => !entrance.unlocked, message: `It's locked.` },
				{ name: "unlock", condition: entrance => this.inventory.contains("key"), message: `Yeah! I unlocked the door.`,
					action: entrance => {
						this.inventory.remove("key");
						this.updateInventory();
						engine.playAudio("audio/dud.mp3", 1);
						entrance.unlocked = true;
						setTimeout(() => {
							this.showBubble(entrance.pendingMessage);
							entrance.pendingMessage = null;
						}, 500);
					},
				},
				{ name: "open", condition: entrance => entrance.unlocked && !entrance.opened,
					action: entrance => {
						engine.playAudio("audio/door.mp3", .3);
						entrance.changeAnimation(this.atlas.entrance_open, engine.lastTime);
					},
				},
				{ name: "enter", condition: entrance => entrance.opened && this.title.innerText.toLowerCase().contains("impossible"), message: () => `I don't want to go in, it's ${this.title.innerText}! I might never escape!` },
				{ name: "enter", condition: entrance => entrance.opened && !this.title.innerText.toLowerCase().contains("impossible"), message: () => `I guess this is not the impossible room. This is ${this.title.innerText}. Okay, I shall go in.`,
					action: entrance => {
						this.monkor.paused = engine.lastTime;
						this.showBubble(entrance.pendingMessage, () => {
							setTimeout(() => {
								this.showBubble(null);
								this.monkor.goingup = engine.lastTime;
							}, 1000);
						});
						entrance.pendingMessage = null;
					},
				},
			],
			onFrame: {
				6: entrance => {
					if (!entrance.opened) {
						entrance.changeAnimation(this.atlas.entrance_opened, engine.lastTime);
						entrance.opened = true;
					}
				},
			},
		});

		engine.spriteCollection.create({
			name: "sign",
			anim: this.atlas.sign,
			size: [800, 400],
		}, {
			actions: [
				{ name: "read", message: `I read: "This is the entrance of the impossible room. It's impossible to get in, and impossible to get out."` },
			],
		});

		engine.spriteCollection.create({
			name: "graffiti",
			anim: this.atlas.smokingsign,
			size: [800, 400],
		}, {
			actions: [
				{ name: "read", message: `It says: "Smoking will kill you". Hum... I don't believe so.` },
			],
		});

		engine.spriteCollection.create({
			name: "cigarette",
			anim: this.atlas.cigarette,
			size: [800, 400],
		}, {
			actions: [
				{ name: "look", message: `It's a half smoked cigarette butt on the ground.` },
				{ name: "pick up", message: "Sure, I'll pick up this cigarette butt on the ground, half smoked by a random person.",
					action: item => {
						item.changeOpacity(0, engine.lastTime);
						this.inventory.push("cigarette");
						this.updateInventory();
						engine.playAudio("audio/pickup.mp3", .3);
						this.showBubble(item.pendingMessage);
						item.pendingMessage = null;
					}
				}
			],
		});

		this.mat = engine.spriteCollection.create({
			name: "mat",
			anim: this.atlas.mat,
			size: [800, 400],
		}, {
			actions: [
				{ name: "look", condition: mat => !mat.opened, message: `It's a mat in front of the entrance. It says: "You're welcome to try."` },
				{ name: "look", condition: mat => mat.opened && !mat.pickedKey, message: `There's a key. Should I pick it up?` },
				{ name: "look", condition: mat => mat.opened && mat.pickedKey, message: `Nothing left but dust under the mat.` },
				{ name: "pull", condition: mat => !mat.opened, message: `How surprising, there's a key under the mat!`,
					action: mat => {
						engine.playAudio("audio/hit.mp3", .5);
						mat.changeAnimation(this.atlas.mat_pulling, engine.lastTime);
					}
				},
				{ name: "pickup key", condition: mat => mat.opened && !mat.pickedKey, message: `I wonder where that key fits...`,
					action: mat => {
						mat.changeAnimation(this.atlas.mat_picked_key, engine.lastTime);
						this.inventory.push("key");
						this.updateInventory();
						engine.playAudio("audio/pickup.mp3", .3);
						this.showBubble(mat.pendingMessage);
						mat.pendingMessage = null;
					}
				},
			],
			onFrame: {
				2: mat => {
					if (!mat.opened) {
						mat.changeAnimation(this.atlas.mat_pulled, engine.lastTime);
						mat.opened = true;
						if (mat.pendingMessage) {
							this.showBubble(mat.pendingMessage);
							mat.pendingMessage = null;
						}
					}
				},
			},
		});

		this.monkor = engine.spriteCollection.create({
			name: "monkor",
			x: 50, y: 380,
			size: [128, 128],
			hotspot: [64,128],
			anim: this.atlas.monkor_still,
		});

		this.mouse = engine.spriteCollection.create({
			name: "mouse",
			size: [24, 24],
			hotspot: [12, 12],
			anim: this.atlas.mouse,
			opacity: 0,
		}, {
			goal: { x:0, y:0 },
		});

		this.piano = engine.spriteCollection.create({
			name: "piano",
			opacity: 0,
			size: [300, 200],
			hotspot: [150, 200],
			anim: this.atlas.piano,
		});

		this.monkor.goal = {x:this.monkor.x, y:this.monkor.y};
		this.monkor.speed = 1;

		engine.keyboardHandler.addKeyUpListener("Escape", e => {
			console.log("Escape");
		});

		/* Addd audio listener */
		engine.keyboardHandler.addKeyUpListener("m", e => {
			const audio = document.getElementById("audio");
			this.setAudio(audio, audio.paused, .5);
		});

		//	Allow audio
		// let f;
		// keyboardHandler.addKeyDownListener(null, f = e => {
		// 	//console.log(e.key);
		// 	const audio = document.getElementById("audio");
		// 	this.setAudio(audio, false, 0, true);
		// 	keyboardHandler.removeListener(f);
		// 	document.removeListener("mousedown", f2);
		// });

		// let f2;
		// document.addEventListener("mousedown", f2 = e => {
		// 	//console.log(e.key);
		// 	const audio = document.getElementById("audio");
		// 	this.setAudio(audio, false, 0, true);
		// 	keyboardHandler.removeListener(f);
		// 	document.removeListener("mousedown", f2);
		// });

		// keyboardHandler.addKeyDownListener("t", e => {
		// 	this.test(this.lastTime);
		// });

		engine.keyboardHandler.addKeyDownListener("r", e => {
			const msg = "Actually I lied. Pressing R does nothing.";
			if (window.speechSynthesis) {
				const utterance = engine.getUterrance(msg, ["Mei-Jia", "Google UK English Female"]);
				window.speechSynthesis.speak(utterance);			
			}
			document.getElementById("pressing-r").innerText = msg;
		});

		document.getElementById("title").addEventListener("click", e => {
			if (!this.active()) {
				return;
			}
			this.selectTarget(this.inventoryDetails.title);
			this.showActions(this.inventoryDetails.title);
		});

		document.addEventListener("mousedown", e => {
			if (e.target.id === "title") {
				return;
			}
			if (e.target.id === "im") {
				return;
			}
			this.handleMouse(e);
		});
		document.addEventListener("mousemove", e => {
			if (e.target.id === "im" || e.target.id === "title") {
				return;
			}
			this.handleMouse(e);
		});
		document.addEventListener("mouseup", e => {
			if (e.target.id === "im" || e.target.id === "title") {
				return;
			}
			this.handleMouse(e);
		});

//		console.log(gl);
		document.getElementById("title").style.opacity = .5;

		this.score = parseInt(localStorage.getItem("score") || 0);
		this.chocolate = parseInt(localStorage.getItem("chocolate") || 0);
		this.dinoCount = parseInt(localStorage.getItem("dino") || 0);

		this.title = document.getElementById("title");
		this.ready = true;
	}

	onDropMouse(e) {
		const { lastTime, canvas } = this.engine;
		const { pageX, pageY, buttons } = e;
		const x = pageX - canvas.offsetLeft, y = pageY - canvas.offsetTop;
		this.mouse.changePosition(x, y, lastTime);
		this.mouse.changeOpacity(1, lastTime);
		this.mouse.alive = lastTime;
		const divMouse = document.getElementById("mouse");
		divMouse.style.opacity = 0;
		divMouse.setAttribute("draggable", "");
	}

	dropPiano(time) {
		this.piano.dropping = time;
		this.piano.changeOpacity(1, time);
		this.piano.dy = 30;
		this.piano.changePosition(this.monkor.x, this.monkor.y - 1000, time);
	}

	updatePiano(time) {
		if (!this.piano.dropping) {
			return;
		}
		if (this.piano.y < this.monkor.y) {
			this.piano.changePosition(this.piano.x, this.piano.y + this.piano.dy, time);
		} else if(this.piano.anim !== this.atlas.piano_splash) {
			this.piano.changeAnimation(this.atlas.piano_splash, time);
			this.monkor.changeOpacity(0, time);
			this.monkor.dead = time;
			engine.playAudio("audio/piano.mp3", 1);
			const audio = document.getElementById("audio");
			this.setAudio(audio, audio.paused, 0);
			setTimeout(() => this.gameOver(), 5000);
		}
	}

	updateMouse(time) {
		if (this.mouse.alive) {
			if (!this.mouse.lastAction || time - this.mouse.lastAction > 1300) {
				this.mouse.goal.x = 40 + 720 * Math.random();
				this.mouse.goal.y = 345 + 55 * Math.random();
				this.mouse.lastAction = time + Math.random() * 500;
			// this.monkor.goal.x = Math.max(40, Math.min(x, 760));
			// this.monkor.goal.y = Math.max(345, Math.min(400, y));
			}
			const dx = this.mouse.goal.x - this.mouse.x;
			const dy = this.mouse.goal.y - this.mouse.y;
			const dist = Math.sqrt(dx * dx + dy * dy);
			const speed = Math.min(dist, 5);
			if (speed > .1) {
				this.mouse.changeDirection(dx < 0 ? -1 : 1, time);
				this.mouse.changeAnimation(this.atlas.mouse_run, time);
				this.mouse.changePosition(this.mouse.x + speed * dx / dist, this.mouse.y + speed * dy / dist, time);
			} else {
				this.mouse.changeAnimation(this.atlas.mouse, time);
			}
		}
	}

	gameOver() {
		document.getElementById("restart").style.display = "block";
		document.getElementById("game-over").style.display = "block";
		document.getElementById("restart").addEventListener("click", e => {
			document.getElementById("restart").style.display = "none";
			document.getElementById("game-over").style.opacity = 1;
			location.reload();
		});
	}

	updateInventory(selection) {
		const div = document.getElementById("inventory");
		div.innerText = "";
		div.style.display = "flex";
		div.style.flexDirection = "row";
		this.selectedItem = null;
		this.inventory.forEach(item => {
			const k = div.appendChild(document.createElement("div"));
			k.classList.add("inventory-item");
			switch(item) {
				case "key":
					k.innerText = "🗝 key";
					break;
				case "cigarette":
					k.innerText = "🚬 cigarette"
					break;
			}
			k.addEventListener("click", e => {
				if (!this.active()) {
					return;
				}
				this.updateInventory(item);
				//inventoryDetails
			});
			if (selection === item) {
				this.selectedItem = item;
				k.classList.add("selected");				
				const itemDetails = this.inventoryDetails[item];
				this.selectTarget(itemDetails);
				this.showActions(itemDetails);
			}
		});
	}

	active() {
		if (this.monkor.paused || this.monkor.dead || this.mouse.alive || this.monkor.anim === this.atlas.monkor_talk) {
			return false;
		}
		return true;
	}

	handleMouse(e) {
		if (!this.active()) {
			return;
		}
		const { engine } = this;
		const { canvas, lastTime, overlay } = engine;
		const { pageX, pageY, buttons } = e;
		const x = pageX - canvas.offsetLeft, y = pageY - canvas.offsetTop;
		if (x < 0 || y < 0 || x > canvas.offsetWidth || y > canvas.offsetHeight) {
			return;
		}

		if (buttons || e.type !== "mousemove") {
			this.monkor.goal.x = Math.max(40, Math.min(x, 760));
			this.monkor.goal.y = Math.max(345, Math.min(400, y));
			this.monkor.speed = buttons ? 2 : 1;
			if(!buttons) {
				const diff = lastTime - this.lastMouseUp;
				if (diff < 250) {
					this.monkor.speed = 2;
				}
				this.lastMouseUp = lastTime;
			}
		}

		let hovering = null;
		for (let i = 0; i < engine.spriteCollection.size(); i++) {
			const sprite = engine.spriteCollection.get(i);
			if (sprite.actions) {
				const collisionBox = sprite.getCollisionBox(lastTime);
				if (collisionBox && engine.pointContains(x, y, collisionBox)) {
					hovering = sprite;
				}
			}
		}
		if (e.type === "mousedown") {
			this.monkor.touched = hovering;
			this.lastMouseDown = lastTime;
			this.showActions(null);
			if (!this.finishedSpeech()) {
				this.speechBubble.style.opacity = 0;
			}
		} else if (e.type === "mouseup") {
			let newTarget = null;
			if (this.monkor.touched === hovering) {
				const diff = lastTime - this.lastMouseDown;
				if (diff < 250) {
					newTarget = hovering;
				}
			}
			this.selectTarget(newTarget);
			this.monkor.touched = null;
		}
		const focused = this.monkor.target || hovering;
		if (!this.subjectNameDiv) {
			this.subjectNameDiv = document.getElementById("subject-name");
		}
		this.subjectNameDiv.innerText = focused ? focused.name : "";
		overlay.style.cursor = hovering ? "pointer" : "";

		if (this.selectedItem && e.type === "mousedown") {
			this.updateInventory(null);
		}
	}

	selectTarget(target) {
		const { engine } = this;
		if (!this.subjectDiv) {
			this.subjectDiv = document.getElementById("subject");
		}
		if (this.monkor.target !== target) {
			this.monkor.target = target;
			if (this.monkor.target) {
				engine.playAudio("audio/beep.mp3", .5);
				if (!this.subjectNameDiv) {
					this.subjectNameDiv = document.getElementById("subject-name");
				}
				this.subjectNameDiv.innerText = target.name;
				this.subjectDiv.classList.add("selected");
			} else {
				this.subjectDiv.classList.remove("selected");
			}
		}
	}

	showActions(target) {
		if (this.showingTarget !== target) {
			const subjecActions = document.getElementById("subject-actions");
			this.showingTarget = target;
			subjecActions.style.display = this.showingTarget && this.showingTarget.actions ? "" : "none";
			if (this.showingTarget) {

				subjecActions.innerText = "";
				this.showingTarget.actions.forEach(({name, condition, message, action}) => {
					if (!condition || condition(target)) {
						const div = subjecActions.appendChild(document.createElement("div"));
						div.classList.add("action");
						div.innerText = name;
						div.addEventListener("click", e => {
							if (!this.active()) {
								return;
							}
							const msg = typeof(message) === "function" ? message(target) : message;
							if (action) {
								target.pendingMessage = msg;
								action(target);
							} else if (msg) {
								this.showBubble(msg);
							}
							this.selectTarget(null);
							this.updateInventory();
							this.showActions(null);
						});
					}
				});
			}
		}
	}

	showBubble(msg, callback) {
		const { engine } = this;
		const { lastTime, canvas } = engine;
		const speechBubble = this.speechBubble || (this.speechBubble = document.getElementById("speech-bubble"));
		this.monkor.speechStarted = 0;
		this.monkor.speechPause = 0;
		this.monkor.currentSpeech = "";
		this.monkor.lastCharacter = 0;
		this.monkor.characterIndex = 0;
		this.monkor.finishedSpeech = 0;
		if (msg) {
			if (!this.monkor.scared) {
//				speechBubble.style.display = "block";
				speechBubble.style.opacity = 1;

			}
			this.updateBubble(speechBubble);

			const utterance = engine.getUterrance(msg, "Daniel");
			if (utterance.voice.name === "Daniel") {
				this.monkor.speechPause++;
			} else if (utterance.voice.name.startsWith("Microsoft")) {
				this.monkor.speechPause+=2;
			}

			if (utterance) {
				window.speechSynthesis.cancel();
				window.speechSynthesis.speak(utterance);
				utterance.onstart = () => {
					this.monkor.speechStarted = lastTime;
					this.monkor.onEndSpeech = callback;
				};
				utterance.onboundary = e => {
					if (!this.monkor.speechHasBoundary) {
						this.monkor.speechHasBoundary = true;
					}
					this.unblockText();
				};
			} else {
				this.monkor.speechStarted = lastTime;
				this.monkor.onEndSpeech = callback;
				this.monkor.noVoice = true;
			}
			speechBubble.innerText = "";
		} else {
//			speechBubble.style.display = "none";
			speechBubble.style.opacity = 0;
		}
		this.monkor.speech = msg;
	}

	unblockText() {
		this.monkor.speechPause--;
	}

	updateBubble(speechBubble) {
		const { engine } = this;
		const { lastTime, canvas } = engine;
		speechBubble.style.left = `${canvas.offsetLeft + this.monkor.x - speechBubble.offsetWidth/2 - 20}px`;
		speechBubble.style.bottom = `${window.innerHeight - (canvas.offsetTop + this.monkor.y - this.monkor.size[1] - 20)}px`;
	}

	updateSpeech(time) {
		if (this.finishedSpeech()) {
			return;
		}

		const { speech, speechStarted, lastCharacter } = this.monkor;
		if (speech && speechStarted && (this.monkor.speechPause <= 0 || this.monkor.noVoice)) {
			const textSpeed = this.monkor.noVoice ? 50 : 20;
			if (!lastCharacter || time - lastCharacter >= textSpeed) {
				this.monkor.lastCharacter = time;
				const char = speech.charAt(this.monkor.characterIndex);
				this.monkor.currentSpeech += char;
				const speechBubble = this.speechBubble;
				speechBubble.innerText = this.monkor.currentSpeech; //speech.substr(0, numCharacters);
				this.monkor.characterIndex++;
				if (this.monkor.noVoice) {
					this.monkor.speechPause = 0;
				} else if (char === " " && this.monkor.speechHasBoundary) {
					this.monkor.speechPause++;
				}
				if (this.monkor.currentSpeech.length >= speech.length) {
					this.monkor.finishedSpeech = time;
				}
			}
		}
	}

	finishedSpeech() {
		const { speech, currentSpeech, speechStarted, finishedSpeech } = this.monkor;
		return !speechStarted ? 1 : finishedSpeech;
	}

	applyMovement(monkor, dt, time) {
		const { engine } = this;
		const { lastTime } = engine;
		if (this.mouse.alive) {
			if (time - this.mouse.alive < 3000) {
				const dx = this.mouse.x - monkor.x;
				monkor.changeDirection(dx < 0 ? -1 : 1, time);
				monkor.changeAnimation(this.atlas.monkor_scared, time);
				if (!monkor.scared) {
					monkor.scared = time;
					engine.playAudio("audio/scream.mp3", 1);
					this.setAudio(audio, audio.paused, 0);
				}
			} else {
				const dx = -(this.mouse.x - monkor.x);
				monkor.changeDirection(dx < 0 ? -1 : 1, time);
				monkor.changeAnimation(this.atlas.monkor_run, time);
				monkor.changePosition(monkor.x + (dx < 0 ? -5 : 5), monkor.y, time);
				if (!monkor.running_away) {
					monkor.running_away = time;
					setTimeout(() => this.gameOver(), 6000);					
				}
			}
			return;
		}


		if (this.monkor.goingup) {
			const elapsed = Math.max(0, time - this.monkor.goingup - 500);
			if (elapsed > 0) {
				this.monkor.changeAnimation(this.atlas.monkor_back, time);
				this.monkor.changePosition(400, 350 - 30 * (elapsed / 2000), time);
				this.monkor.changeOpacity(Math.max(0, 1 - (elapsed / 2000)), time);
				if (elapsed > 4000 && !this.monkor.levelup) {
					this.monkor.levelup = lastTime;
					document.getElementById("game-over-message").style.display = "block";
					document.getElementById("game-over-message").innerText = "Ok I lied. This room is possible to get into. But you can't get out, because I didn't finish making this game. Sorry! Come back later!";
					this.gameOver();
				}
			}
			return;
		}


		const speed = 2 * monkor.speed;
		const dx = (monkor.goal.x - monkor.x);
		const dy = (monkor.goal.y - monkor.y);
		const dist = Math.sqrt(dx * dx + dy * dy);
		const actualSpeed = Math.min(dist, speed);
		let anim = this.atlas.monkor_still;
		if (dist) {
			monkor.changePosition(monkor.x + actualSpeed * dx / dist, monkor.y + actualSpeed * dy / dist, time);
			monkor.changeDirection(dx < 0 ? -1 : 1, time);
			if (Math.abs(dx) > Math.abs(dy)) {
				anim = this.atlas.monkor_right;
			} else if (dy > 0) {
				anim = this.atlas.monkor_front;
			} else {
				anim = this.atlas.monkor_back;
			}
		} else {
			const finishedSpeech = this.finishedSpeech();
			if (!finishedSpeech && monkor.speechPause <= 0) {
				anim = this.atlas.monkor_talk;
			} else if (monkor.smoking) {
				anim = (time / 400) % 10 < 2 ? this.atlas.monkor_puff : this.atlas.monkor_smoke;
				if (time - monkor.smoking >= 5000 && !this.piano.dropping) {
					this.dropPiano(time);
				}
			}

			if (finishedSpeech) {
				if (monkor.onEndSpeech) {
					monkor.onEndSpeech();
					monkor.onEndSpeech = null;
				}
				if (time - finishedSpeech > 1000 && this.monkor.speechStarted) {
					this.showBubble(null);
				}
			}
		}
		monkor.changeAnimation(anim, time, anim === this.atlas.monkor_talk ? monkor.speechStarted : 0);
	}


	setAudio(audio, value, volume, ignore) {
		if (value) {
			document.getElementById("speaker").innerText = "🔊";
			document.getElementById("mute").innerText = "unmute";
			audio.play();
			if (!this.monkor.dead && !this.monkor.scared && !ignore) {
				this.showBubble("I like this music.");
			}
		} else {
			document.getElementById("speaker").innerText = "🔇";
			document.getElementById("mute").innerText = "mute";
			audio.pause();
			if (!this.monkor.dead && !this.monkor.scared && !ignore) {
				this.showBubble("I don't like this music.");
			}
		}
		audio.volume = volume;
	}

	checkCollisions(time) {
		const { engine } = this;
		const monkorBox = this.monkor.getCollisionBox(time);
		const targetBox = this.monkor.target && this.monkor.target.getCollisionBox ? this.monkor.target.getCollisionBox(time) : null;
		if (engine.doCollide(monkorBox, targetBox)) {
			this.showActions(this.monkor.target);			
		}
	}

	refresh(time, dt) {
		const { state } = this;
		this.applyMovement(this.monkor, dt, time);
		this.checkCollisions(time);
		this.updateSpeech(time);
		this.updatePiano(time);
		this.updateMouse(time);
	}
}

const game = new Game();