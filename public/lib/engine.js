class Engine {
	constructor(config) {
		this.init(config);
	}

	async loadDomContent(document) {
		return new Promise(resolve => document.addEventListener("DOMContentLoaded", () => resolve(document)));
	}	

	isRetinaDisplay() {
        if (window.matchMedia) {
            var mq = window.matchMedia("only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)");
            return (mq && mq.matches || (window.devicePixelRatio > 1)); 
        }
    }

	async init(config) {
		this.config = config;

		if (config.viewport.pixelScale < 1 && !this.isRetinaDisplay()) {
			config.viewport.pixelScale = 1;
		}

		console.log(config);
		const maxInstancesCount = 1000;
		await this.loadDomContent(document);
		console.log("Starting engine...");
		const canvas = document.getElementById("canvas");
		if (!canvas) {
			console.error("You need a canvas with id 'canvas'.");
		}
		this.canvas = canvas;
		const gl = canvas.getContext("webgl", config.webgl) || canvas.getContext("experimental-webgl", config.webgl);
		this.gl = gl;

		this.debugCanvas = document.createElement("canvas");
		this.debugCanvas.style.position = "absolute";
		this.debugCanvas.zIndex = 1;
		document.body.appendChild(this.debugCanvas);
		this.debugCtx = this.debugCanvas.getContext("2d");
		this.debugCanvas.style.display = "none";

		this.overlay = document.getElementById("overlay");

		/* Focus Fixer */
		this.focusFixer = new FocusFixer(canvas);	

		if (!gl.getExtension('OES_element_index_uint')) {
			throw new Error("OES_element_index_uint not available.");
		}
		const ext = gl.getExtension('ANGLE_instanced_arrays');
		if (!ext) {
			throw new Error('need ANGLE_instanced_arrays.');
		}
		this.ext = ext;

		/* Config shader */
		this.configShader(gl);

		/* Initialize Shader program */
		const { vertexShader, fragmentShader, attributes } = globalData;
		this.shader = new Shader(gl, ext, vertexShader, fragmentShader, attributes, maxInstancesCount);

		/* Texture management */
		this.imageLoader = new ImageLoader();
		this.textureManager = new TextureManager(gl, this.shader.uniforms, this.imageLoader);

		/* Load image */
		this.atlas = {
			entrance: await this.textureManager.createAtlas(1).setImage(
				{
					url: "assets/background-door.png",
					cols:2,rows:4,
					collision_url: "assets/background-door-collision.png",
					range:[0],
				}),
			entrance_open: await this.textureManager.createAtlas(1).setImage(
				{
					url: "assets/background-door.png",
					cols:2,rows:4,
					collision_url: "assets/background-door-collision.png",
					frameRate: 10,
					range:[4,6],
				}),
			entrance_opened: await this.textureManager.createAtlas(1).setImage(
				{
					url: "assets/background-door.png",
					cols:2,rows:4,
					collision_url: "assets/background-door-collision.png",
					range:[6],
				}),
			sign: await this.textureManager.createAtlas(3).setImage(
				{
					url: "assets/sign.png",
					collision_url: "assets/sign.png",
				}),
			smokingsign: await this.textureManager.createAtlas(4).setImage(
				{
					url: "assets/smoking-sign.png",
					collision_url: "assets/smoking-sign.png",
				}),
			cigarette: await this.textureManager.createAtlas(5).setImage(
				{
					url: "assets/cigarette.png",
					collision_url: "assets/cigarette.png",
				}),
			piano: await this.textureManager.createAtlas(6).setImage(
				{
					url: "assets/piano.png",
					cols:1,rows:2,
					range:[0],
				}),
			piano_splash: await this.textureManager.createAtlas(6).setImage(
				{
					url: "assets/piano.png",
					cols:1,rows:2,
					range:[1],
				}),
			mouse: await this.textureManager.createAtlas(7).setImage(
				{
					url: "assets/mouse.png",
					cols:2,rows:2,
					range:[0],
				}),
			mouse_run: await this.textureManager.createAtlas(7).setImage(
				{
					url: "assets/mouse.png",
					cols:2,rows:2,
					frameRate: 20,
					range:[1, 2],
				}),
			mat: await this.textureManager.createAtlas(2).setImage(
				{
					url: "assets/mat.png",
					cols:2,rows:4,
					collision_url: "assets/mat-collision.png",
					range:[0],
				}),
			mat_pulling: await this.textureManager.createAtlas(2).setImage(
				{
					url: "assets/mat.png",
					cols:2,rows:4,
					collision_url: "assets/mat-collision.png",
					frameRate: 4,
					range:[1, 2],
				}),
			mat_pulled: await this.textureManager.createAtlas(2).setImage(
				{
					url: "assets/mat.png",
					cols:2,rows:4,
					collision_url: "assets/mat-collision.png",
					range:[2],
				}),
			mat_picked_key: await this.textureManager.createAtlas(2).setImage(
				{
					url: "assets/mat.png",
					cols:2,rows:4,
					collision_url: "assets/mat-collision.png",
					range:[3],
				}),
			monkor_still: await this.textureManager.createAtlas(0).setImage(
				{
					url: "assets/monkor.png",
					collision_url: "assets/monkor-collision.png",
					cols:5,rows:5,
					range:[0],
				}),
			monkor_front: await this.textureManager.createAtlas(0).setImage(
				{
					url: "assets/monkor.png",
					cols:5,rows:5,
					frameRate:10,
					range:[1, 4],
				}),
			monkor_back: await this.textureManager.createAtlas(0).setImage(
				{
					url: "assets/monkor.png",
					cols:5,rows:5,
					frameRate:10,
					range:[5, 8],
				}),
			monkor_right: await this.textureManager.createAtlas(0).setImage(
				{
					url: "assets/monkor.png",
					cols:5,rows:5,
					frameRate:10,
					range:[9, 12],
				}),
			monkor_talk: await this.textureManager.createAtlas(0).setImage(
				{
					url: "assets/monkor.png",
					cols:5,rows:5,
					frameRate:10,
					range:[13, 16],
				}),
			monkor_smoke: await this.textureManager.createAtlas(0).setImage(
				{
					url: "assets/monkor.png",
					cols:5,rows:5,
					frameRate:8,
					range:[17, 19],
				}),
			monkor_puff: await this.textureManager.createAtlas(0).setImage(
				{
					url: "assets/monkor.png",
					cols:5,rows:5,
					range:[20],
				}),
			monkor_scared: await this.textureManager.createAtlas(0).setImage(
				{
					url: "assets/monkor.png",
					cols:5,rows:5,
					range:[21],
				}),
			monkor_run: await this.textureManager.createAtlas(0).setImage(
				{
					url: "assets/monkor.png",
					cols:5,rows:5,
					frameRate:10,
					range:[21, 24],
				}),
		};

		/* Load sprite */
		this.spriteCollection = new SpriteCollection();
		const [viewportWidth, viewportHeight] = this.config.viewport.size;


		String.prototype.contains = Array.prototype.contains = function(str) {
			return this.indexOf(str) >= 0;
		};
		Array.prototype.remove = function(str) {
			this.splice(this.indexOf(str), 1);
		};

		this.inventory = [];

		this.inventoryDetails = {
			key: {
				actions: [
					{ name: "look", message: () => "I picked up some keys that didn't belong to me from under a mat." },
					{ name: "eat", message: () => "I swallowed the key. Now, this game is truly IMPOSSIBLE!.", 
						action: key => {
							this.inventory.remove("key");
							this.updateInventory();
							this.playAudio("audio/eat.mp3", .5);
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
								this.monkor.smoking = this.lastTime;
								this.monkor.paused = this.lastTime;
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

		this.spriteCollection.create({
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
						this.playAudio("audio/dud.mp3", .3);
						entrance.unlocked = true;
						this.showBubble(entrance.pendingMessage);
						entrance.pendingMessage = null;
					},
				},
				{ name: "open", condition: entrance => entrance.unlocked && !entrance.opened,
					action: entrance => {
						this.playAudio("audio/door.mp3", .3);
						entrance.changeAnimation(this.atlas.entrance_open, this.lastTime);
					},
				},
				{ name: "enter", condition: entrance => entrance.opened && this.title.innerText.toLowerCase().contains("impossible"), message: () => `I don't want to go in, it's ${this.title.innerText}! I might never escape!` },
				{ name: "enter", condition: entrance => entrance.opened && !this.title.innerText.toLowerCase().contains("impossible"), message: () => `I guess this is not the impossible room. This is ${this.title.innerText}. Okay, I shall go in.`,
					action: entrance => {
						this.monkor.paused = this.lastTime;
						this.showBubble(entrance.pendingMessage, () => {
							this.showBubble(null);
							this.monkor.goingup = this.lastTime;
						});
						entrance.pendingMessage = null;
					},
				},
			],
			onFrame: {
				6: entrance => {
					if (!entrance.opened) {
						entrance.changeAnimation(this.atlas.entrance_opened, this.lastTime);
						entrance.opened = true;
					}
				},
			},
		});

		this.spriteCollection.create({
			name: "sign",
			anim: this.atlas.sign,
			size: [800, 400],
		}, {
			actions: [
				{ name: "read", message: `I read: "This is the entrance of the impossible room. It's impossible to get in, and impossible to get out."` },
			],
		});

		this.spriteCollection.create({
			name: "graffiti",
			anim: this.atlas.smokingsign,
			size: [800, 400],
		}, {
			actions: [
				{ name: "read", message: `It says: "Smoking will kill you". I don't believe so.` },
			],
		});

		this.spriteCollection.create({
			name: "cigarette",
			anim: this.atlas.cigarette,
			size: [800, 400],
		}, {
			actions: [
				{ name: "look", message: `It's a half smoked cigarette butt on the ground."` },
				{ name: "pick up", message: "Sure, I'll pick up this cigarette butt on the ground, half smoked by a random person.",
					action: item => {
						item.changeOpacity(0, this.lastTime);
						this.inventory.push("cigarette");
						this.updateInventory();
						this.playAudio("audio/pickup.mp3", .3);
						this.showBubble(item.pendingMessage);
						item.pendingMessage = null;
					}
				}
			],
		});

		this.mat = this.spriteCollection.create({
			name: "mat",
			anim: this.atlas.mat,
			size: [800, 400],
		}, {
			actions: [
				{ name: "look", condition: mat => !mat.opened, message: `It's a mat in front of the entrance.` },
				{ name: "look", condition: mat => mat.opened && !mat.pickedKey, message: `There's a key. Should I pick it up?` },
				{ name: "look", condition: mat => mat.opened && mat.pickedKey, message: `Nothing left but dust under the mat.` },
				{ name: "pull", condition: mat => !mat.opened, message: `How surprising, there's a key under the mat!`,
					action: mat => {
						this.playAudio("audio/hit.mp3", .5);
						mat.changeAnimation(this.atlas.mat_pulling, this.lastTime);
					}
				},
				{ name: "pickup key", condition: mat => mat.opened && !mat.pickedKey, message: `I wonder where that key fits...`,
					action: mat => {
						mat.changeAnimation(this.atlas.mat_picked_key, this.lastTime);
						this.inventory.push("key");
						this.updateInventory();
						this.playAudio("audio/pickup.mp3", .3);
						this.showBubble(mat.pendingMessage);
						mat.pendingMessage = null;
					}
				},
			],
			onFrame: {
				2: mat => {
					if (!mat.opened) {
						mat.changeAnimation(this.atlas.mat_pulled, this.lastTime);
						mat.opened = true;
						if (mat.pendingMessage) {
							this.showBubble(mat.pendingMessage);
							mat.pendingMessage = null;
						}
					}
				},
			},
		});

		this.monkor = this.spriteCollection.create({
			name: "monkor",
			x: 50, y: 380,
			size: [128, 128],
			hotspot: [64,128],
			anim: this.atlas.monkor_still,
		});

		this.mouse = this.spriteCollection.create({
			name: "mouse",
			size: [32, 32],
			hotspot: [16, 16],
			anim: this.atlas.mouse,
			opacity: 0,
		}, {
			goal: { x:0, y:0 },
		});

		this.piano = this.spriteCollection.create({
			name: "piano",
			opacity: 0,
			size: [300, 200],
			hotspot: [150, 200],
			anim: this.atlas.piano,
		});

		this.monkor.goal = {x:this.monkor.x, y:this.monkor.y};
		this.monkor.speed = 1;

		/* Buffer renderer */
		this.bufferRenderer = new BufferRenderer(gl, this.config);
		this.spriteRenderer = new SpriteRenderer(this.bufferRenderer, this.shader, this.config.viewport.size);

		/* Setup constants */
		this.numInstances = 70;	//	Note: This shouldn't be constants. This is the number of instances.
		this.numVerticesPerInstance = 6;

		const keyboardHandler = new KeyboardHandler(document); 
		this.keyboardHandler = keyboardHandler;
		keyboardHandler.addKeyUpListener("Escape", e => {
			console.log("Escape");
		});

		/* Addd audio listener */
		keyboardHandler.addKeyUpListener("m", e => {
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

		keyboardHandler.addKeyDownListener("r", e => {
			const msg = "Actually I lied. Pressing R does nothing.";
			if (window.speechSynthesis) {
				const utterance = this.getUterrance(msg, 39);
				window.speechSynthesis.speak(utterance);			
			}
			document.getElementById("pressing-r").innerText = msg;
		});

		document.getElementById("title").addEventListener("click", e => {
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

		console.log(gl);

		this.score = parseInt(localStorage.getItem("score") || 0);
		this.chocolate = parseInt(localStorage.getItem("chocolate") || 0);
		this.dinoCount = parseInt(localStorage.getItem("dino") || 0);

		this.title = document.getElementById("title");

		this.resize(canvas, gl, config);

		this.lastTime = 0;

		const voices = window.speechSynthesis.getVoices();
		console.log(voices);

		this.initialize(gl, this.shader.uniforms, config);

		Engine.start(this);
	}

	// snapshot() {
	// }

	// retain(object) {
	// }

	// restore(object) {
	// }

	onDropMouse(e) {
		const { pageX, pageY, buttons } = e;
		const x = pageX - this.canvas.offsetLeft, y = pageY - this.canvas.offsetTop;
		this.mouse.changePosition(x, y, this.lastTime);
		this.mouse.changeOpacity(1, this.lastTime);
		this.mouse.alive = this.lastTime;
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
			this.playAudio("audio/piano.mp3", 1);
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

	getUterrance(msg, voiceId) {
		if (!this.utterrances) {
			this.utterrances = {};
		}
		if (this.utterrances[msg + voiceId]) {
			return this.utterrances[msg + voiceId];
		}
		const utterance = new SpeechSynthesisUtterance();
		utterance.text = msg;
		if (!this.voices) {
			this.voices = speechSynthesis.getVoices();
		}
		const voices = this.voices;
		utterance.voice = voices[voiceId];
		this.utterrances[msg + voiceId] = utterance;
		return utterance;

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

	handleMouse(e) {
		if (this.monkor.paused || this.monkor.dead || this.mouse.alive || this.monkor.anim === this.atlas.monkor_talk) {
			return;
		}
		const { pageX, pageY, buttons } = e;
		const x = pageX - this.canvas.offsetLeft, y = pageY - this.canvas.offsetTop;
		if (x < 0 || y < 0 || x > this.canvas.offsetWidth || y > this.canvas.offsetHeight) {
			return;
		}

		if (buttons || e.type !== "mousemove") {
			this.monkor.goal.x = Math.max(40, Math.min(x, 760));
			this.monkor.goal.y = Math.max(345, Math.min(400, y));
			this.monkor.speed = buttons ? 2 : 1;
			if(!buttons) {
				const diff = this.lastTime - this.lastMouseUp;
				if (diff < 250) {
					this.monkor.speed = 2;
				}
				this.lastMouseUp = this.lastTime;
			}
		}

		let hovering = null;
		for (let i = 0; i < this.spriteCollection.size(); i++) {
			const sprite = this.spriteCollection.get(i);
			if (sprite.actions) {
				const collisionBox = sprite.getCollisionBox(this.lastTime);
				if (collisionBox && this.pointContains(x, y, collisionBox)) {
					hovering = sprite;
				}
			}
		}
		if (e.type === "mousedown") {
			this.monkor.touched = hovering;
			this.lastMouseDown = this.lastTime;
			this.showActions(null);
			this.showBubble(null);
		} else if (e.type === "mouseup") {
			let newTarget = null;
			if (this.monkor.touched === hovering) {
				const diff = this.lastTime - this.lastMouseDown;
				if (diff < 250) {
					newTarget = hovering;
				}
			}
			this.selectTarget(newTarget);
			this.monkor.touched = null;
		}
		const focused = this.monkor.target || hovering;
		const subjectName = document.getElementById("subject-name");
		subjectName.innerText = focused ? focused.name : "";
		this.overlay.style.cursor = hovering ? "pointer" : "";

		if (this.selectedItem && e.type === "mousedown") {
			this.updateInventory(null);
		}
	}

	selectTarget(target) {
		const subject = document.getElementById("subject");
		if (this.monkor.target !== target) {
			this.monkor.target = target;
			if (this.monkor.target) {
				this.playAudio("audio/beep.mp3", .5);
				const subjectName = document.getElementById("subject-name");
				subjectName.innerText = target.name;
				subject.classList.add("selected");
			} else {
				subject.classList.remove("selected");
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
		const speechBubble = document.getElementById("speech-bubble");
		this.monkor.speechStarted = 0;
		if (msg) {
			if (!this.monkor.scared) {
				speechBubble.style.display = "block";
			}
			speechBubble.style.left = `${canvas.offsetLeft + this.monkor.x - speechBubble.offsetWidth/2 - 20}px`;
			speechBubble.style.top = `${canvas.offsetTop + this.monkor.y - this.monkor.size[1] - speechBubble.offsetHeight - 20}px`;

			if (window.speechSynthesis) {
				const utterance = this.getUterrance(msg, 16);
				window.speechSynthesis.speak(utterance);
				utterance.onstart = () => {
					this.monkor.speechStarted = this.lastTime;
					this.monkor.onEndSpeech = callback;
				};
			} else {
				this.monkor.speechStarted = this.lastTime;
				this.monkor.onEndSpeech = callback;
			}
		} else {
			speechBubble.style.display = "none";
		}
		speechBubble.innerText = "";
		this.monkor.speech = msg;
	}

	updateSpeech(time) {
		const { speech, speechStarted } = this.monkor;
		if (speech && speechStarted) {
			const timeEllapsed = time - speechStarted;
			const numCharacters = Math.ceil(timeEllapsed / 50);
			const speechBubble = document.getElementById("speech-bubble");
			speechBubble.innerText = speech.substr(0, numCharacters);
		}
	}

	finishedSpeech(time) {
		const { speech, speechStarted } = this.monkor;
		if (!speech) {
			return 1;
		}
		const timeEllapsed = time - speechStarted;
		const numCharacters = Math.ceil(timeEllapsed / 50);
		return numCharacters <= speech.length ? 0 : numCharacters - speech.length;
	}

	pointContains(x, y, collisionBox) {
		const px = x, py = y;
		return collisionBox.left <= px && px <= collisionBox.right && collisionBox.top <= py && py <= collisionBox.bottom;
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

	initialize(gl, uniforms, {viewport: {pixelScale, size: [viewportWidth, viewportHeight]}}) {
		this.bufferRenderer.setAttribute(this.shader.attributes.vertexPosition, 0, Utils.FULL_VERTICES);		
		gl.clearColor(.1, .0, .0, 1);

		const viewMatrix = mat4.fromTranslation(mat4.create(), vec3.fromValues(0, 0, 0));
		gl.uniformMatrix4fv(uniforms.view.location, false, viewMatrix);

		const zNear = -1;
		const zFar = 2000;
		const orthoMatrix = mat4.ortho(mat4.create(), -viewportWidth, viewportWidth, -viewportHeight, viewportHeight, zNear, zFar);		
		gl.uniformMatrix4fv(uniforms.ortho.location, false, orthoMatrix);
	}

	applyKeyboard(monkor, keyboardHandler, time) {

	}

	applyMovement(monkor, dt, time) {

		if (this.mouse.alive) {
			if (time - this.mouse.alive < 3000) {
				const dx = this.mouse.x - monkor.x;
				monkor.changeDirection(dx < 0 ? -1 : 1, time);
				monkor.changeAnimation(this.atlas.monkor_scared, time);
				if (!monkor.scared) {
					monkor.scared = time;
					this.playAudio("audio/scream.mp3", 1);
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
					this.monkor.levelup = this.lastTime;
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
			const finishedSpeech = this.finishedSpeech(time);
			if (!finishedSpeech) {
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
				if (finishedSpeech > 50 && this.monkor.speechStarted) {
					this.showBubble(null);
				}
			}
		}
		monkor.changeAnimation(anim, time);
	}

	configShader(gl) {
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	}

	resize(canvas, gl, {viewport: {pixelScale, size: [viewportWidth, viewportHeight]}}) {
		canvas.width = viewportWidth / pixelScale;
		canvas.height = viewportHeight / pixelScale;
		canvas.style.width = `${viewportWidth}px`;
		canvas.style.height = `${viewportHeight}px`;
		canvas.style.opacity = 1;
		document.getElementById("title").style.opacity = .5;
  		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	}

	static start(engine) {
		const loop = (time) => {
			engine.refresh(time);
		  	requestAnimationFrame(loop);
		};
		loop(0);
	}



	// getNextScene(scene, direction, state) {
	// 	if (state.gameOver) {
	// 		return scene;
	// 	}
	// 	if (state.win) {
	// 		return scene;
	// 	}
	// 	if (scene.startsWith("inter-")) {
	// 		const sceneBase = scene.split("inter-")[1];
	// 		return direction < 0 ? sceneBase + "-" : sceneBase;
	// 	}
	// 	if (scene.startsWith("inter+")) {
	// 		const sceneBase = scene.split("inter+")[1];
	// 		return direction >= 0 ? sceneBase + "+" : sceneBase;
	// 	}
	// 	return "inter" + (direction < 0 ? "-" : "+") + scene;
	// }

	// onScene(scene, state) {
	// 	const { gl } = this;
	// 	document.getElementById("sexy").style.display = "none";
	// 	document.getElementById("elon").style.display = "none";
	// 	document.getElementById("police").style.display = "none";
	// 	document.getElementById("drug").style.display = "none";
	// 	document.getElementById("annie").style.display = "none";
	// 	if (state.gameOver) {
	// 		document.getElementById("eva").style.display = "none";
	// 	}
	// 	switch(scene) {
	// 		case "phase3-":
	// 			document.getElementById("annie").style.display = "";
	// 			break;
	// 		case "phase2-":
	// 			document.getElementById("police").style.display = "";
	// 			break;
	// 		case "phase2+":
	// 			document.getElementById("drug").style.display = "";
	// 			break;
	// 		case "base--":
	// 			document.getElementById("sexy").style.display = "";
	// 			break;
	// 		case "base++":
	// 			document.getElementById("elon").style.display = "";
	// 			break;
	// 		case "phase3+":
	// 			const audio = document.getElementById("audio");
	// 			document.getElementById("audio-god").volume = audio.paused ? .2 : .4;
	// 			document.getElementById("audio-god").play();
	// 			break;	
	// 		case "with-eva":
	// 			if (!state.gameOver) {
	// 				this.findEva(state);
	// 			}
	// 			break;
	// 		case "reset":
	// 			document.getElementById("audio").pause();
	// 			document.getElementById("controls").style.display = "";
	// 			this.resetState(state);
	// 			gl.clearColor(.8, .8, .8, 1);
	// 			break;
	// 		default:
	// 			break;
	// 	}
	// }

	// findEva(state) {
	// 	document.getElementById("eva").style.display = "";
	// 	localStorage.removeItem("lost-eva");
	// 	localStorage.setItem("with-eva", true);
	// 	state.win = true;
	// }

	// winEva(state) {
	// 	getMedal("Eva");
	// }

	// gameOver(medal, state) {
	// 	state.gameOver = true;
	// 	getMedal(medal);
	// 	document.getElementById("audio").pause();
	// }

	// getMessage(scene, state) {
	// 	if (state.gameOver) {
	// 		return "I lost Eva.";			
	// 	}
	// 	switch(scene) {
	// 		case "base":
	// 			return "I lost Eva. I must find her...";
	// 		case "inter-base":
	// 		case "inter+base":
	// 			return "...";
	// 		case "inter-phase2":
	// 		case "inter+phase2":
	// 			return "...!";
	// 		case "inter-phase3":
	// 		case "inter+phase3":
	// 			return "...!?!";
	// 		case "base+":
	// 			return "Where did Eva go? Right direction?...";
	// 		case "base-":
	// 			return "Where did Eva go? Left direction?...";
	// 		case "base--":
	// 			return "“Hello handsome man! care to join me for some fun?”";
	// 		case "inter-base--":
	// 			this.gameOver("Sexy", state);
	// 			return "I spent some time with Tina, before looking for Eva. I never found her ever again.";
	// 		case "base++":
	// 			return "“Hi. I'm Elon Musk. Would you like to work for me? Come in and fill out an application.”";
	// 		case "inter+base++":
	// 			this.gameOver("Elon", state);
	// 			return "I applied for a job at Tesla, then pursued your research. But Eva was never found.";
	// 		case "phase2":
	// 			return "I'm lost... Where could have she gone?";
	// 		case "phase2-":
	// 			return "“Lost someone? Sure, come to the police station. You can file a report.”";
	// 		case "inter-phase2-":
	// 			this.gameOver("Police", state);
	// 			return "After filing a report, I waited and waited... Still no sign of Eva.";
	// 		case "phase2+":
	// 			return "“Don't worry buddy, your little lady is gonna come around. Come join us, how'bout some drugs?...”";
	// 		case "inter+phase2+":
	// 			this.gameOver("Drugs", state);
	// 			return "I lost myself in drugs and drown your memories of Eva in alcohol.";
	// 		case "phase3":
	// 			return "I won't let anyone distract me. I must find Eva!";
	// 		case "phase3-":
	// 			return "“Oh Adam! It's me, Annie! Wow, you haven't changed a bit since high school...”";
	// 		case "inter-phase3-":
	// 			this.gameOver("Annie", state);
	// 			return "I reconnected with Annie, remembering the good times. Then continued my search.";
	// 		case "phase3+":
	// 			return "“Adam... This is the voice of God. Go forth and you shall find what you are looking for.”";
	// 		case "inter+phase3+":
	// 			this.gameOver("God", state);
	// 			return "I moved forward towards my faith... and found God!";
	// 		case "phase4":
	// 			return "Where can she possibly be?";
	// 		case "phase4+":
	// 			return "Oh Eva, will I ever see you again?";
	// 		case "phase4++":
	// 			return "I will never stop until I find you.";
	// 		case "with-eva":
	// 			document.getElementById("audio").pause();
	// 			return "Eva!";
	// 		default:
	// 	}
	// 	return "";
	// }

	doCollide(box1, box2, time) {
		if (!box1 || !box2) {
			return false;
		}
		return box1.right >= box2.left && box2.right >= box1.left && box1.bottom >= box2.top && box2.bottom >= box1.top;
	}

	checkCollisions(time) {
		const monkorBox = this.monkor.getCollisionBox(time);	
		for (let i = 0; i < this.spriteCollection.size(); i++) {
			const sprite = this.spriteCollection.get(i);
			if (sprite.actions) {
				const collisionBox = sprite.getCollisionBox(time);
				if (this.doCollide(monkorBox, collisionBox)) {
					if (sprite === this.monkor.target) {
						this.showActions(sprite);
					}
				}
			}
		}
	}

	handleFrames(time) {
		for (let i = 0; i < this.spriteCollection.size(); i++) {
			const sprite = this.spriteCollection.get(i);
			if (sprite.onFrame) {
				const f = sprite.onFrame[sprite.getAnimationFrame(time)];
				if (f) {
					f(sprite);
				}
			}
		}		
	}

	showDebugCanvas(time) {
		this.debugCanvas.width = this.canvas.width;
		this.debugCanvas.height = this.canvas.height;
		this.debugCanvas.style.width = `${this.canvas.offsetWidth}px`;
		this.debugCanvas.style.height = `${this.canvas.offsetHeight}px`;
		this.debugCanvas.style.left = `${this.canvas.offsetLeft}px`;
		this.debugCanvas.style.top = `${this.canvas.offsetTop}px`;
		this.debugCanvas.style.display = "";
		const ctx = this.debugCtx;
		const { config: { viewport: { pixelScale } } } = this;
		const margin = 10 / pixelScale;
		ctx.clearRect(0, 0, this.debugCanvas.width, this.debugCanvas.height);
		ctx.beginPath();
		ctx.rect(margin, margin, this.debugCanvas.width - margin * 2, this.debugCanvas.height - margin * 2);
		ctx.stroke()

//		const { cheoni } = this;
		ctx.strokeStyle = "#FF0000";
		ctx.beginPath();


		for (let i = 0; i < this.spriteCollection.size(); i++) {
			const sprite = this.spriteCollection.get(i);
			this.drawCollisionBox(ctx, sprite, time);
		}

		ctx.stroke();

	}

	drawCollisionBox(ctx, sprite, time) {
		const { config: { viewport: { pixelScale } } } = this;
		const rect = sprite.getCollisionBox(time);
		if (!rect) {
			return;
		}
		ctx.rect(rect.left / pixelScale, rect.top / pixelScale, (rect.right - rect.left) / pixelScale, (rect.bottom - rect.top) / pixelScale);
	}

	playAudio(sound, volume) {
		const audio = new Audio();
		audio.src = sound;
		audio.volume = volume || 1;
		audio.play();
	}

	refresh(time) {
		const dt = time - this.lastTime;
		if (!this.focusFixer.focused) {
			this.lastTime = time;
			return;
		}

		const { gl, ext } = this;
		const {viewport: {size: [viewportWidth, viewportHeight]}} = this.config;
		const {attributes, uniforms} = this.shader;

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.uniform1f(uniforms.time.location, time);

		const { state } = this;
		// this.applySceneChange(state, time);
		// this.applyKeyboard(this.cheoni, this.keyboardHandler, time);
		this.applyMovement(this.monkor, dt, time);

		// for (let i = 0; i < this.balloons.length; i++) {
		// 	// this.moveBalloon(this.balloons[i], i, time, dt);
		// 	// this.checkBalloon(this.balloons[i], this.cheoni, time);
		// }

		this.checkCollisions(time);

		this.updateSpeech(time);

		this.handleFrames(time);

		this.updatePiano(time);
		this.updateMouse(time);

		// this.processCandies(dt, time);
		// this.processPipe(time);

		//	sprite
		//	- x, y, width, height
		//	- hotspot
		//	- rotation
		//	- direction
		//	- anim.src
		//	- anim (cols, rows, frameRate)
		// if (this.adam.x !== state.x || this.adam.y !== state.y) {
		// 	this.adam.x = state.x;
		// 	this.adam.y = state.y;
		// 	this.adam.updated.sprite = time;
		// }
		// const anim = this.shouldMove(state, viewportWidth) ? this.atlas.run : this.atlas.still;
		// if (state.anim != anim || state.animDirection != state.direction || (state.hideSelf && this.adam.opacity >= 1)) {
		// 	state.anim = anim;
		// 	state.animDirection = state.direction;
		// 	this.adam.direction = state.direction;
		// 	this.adam.anim = anim;
		// 	this.adam.opacity = state.hideSelf ? 0 : 1;
		// 	this.adam.updated.animation = time;
		// }

		for (let i = 0; i < this.spriteCollection.size(); i++) {
			const sprite = this.spriteCollection.get(i);
			if (sprite.updated.sprite >= this.lastTime) {
				const {x, y, rotation, size:[width,height], hotspot:[hotX,hotY]} = sprite;
				this.spriteRenderer.setAttributeSprite(i, x, y, width, height, hotX, hotY, rotation);
			}
			if (sprite.updated.animation >= this.lastTime
				|| sprite.updated.direction >= this.lastTime
				|| sprite.updated.opacity >= this.lastTime) {
				const {direction, opacity} = sprite;
				this.spriteRenderer.setAnimation(i, sprite.anim, direction, opacity);
			}
			if (sprite.updated.updateTime >= this.lastTime) {
				this.spriteRenderer.setUpdateTime(i, sprite);
			}
		}

		// document.getElementById("info-box").innerText = this.cheoni.getAnimationFrame(time);

		//	DRAW CALL
		ext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, this.numVerticesPerInstance, this.numInstances);
		this.lastTime = time;
//		this.showDebugCanvas(time);
	}
}

const engine = new Engine(globalData.config);