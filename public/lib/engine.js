class Engine {
	constructor(config) {
		this.init(config);
	}

	async loadDomContent(document) {
		return new Promise(resolve => document.addEventListener("DOMContentLoaded", () => resolve(document)));
	}	

	async init(config) {
		this.config = config;
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
			background: await this.textureManager.createAtlas(1).setImage({
				url: "assets/grass.png",
			}),
			dino: await this.textureManager.createAtlas(5).setImage({
				url: "assets/dino-stupid.png",
				cols: 1, rows: 2,
				frameRate: 2,
				range: [0, 1],
			}),
			sparkle: await this.textureManager.createAtlas(6).setImage({
				url: "assets/sparkle.png",
			}),
			pipe_out: await this.textureManager.createAtlas(7).setImage({
				url: "assets/pipe.png",
				cols: 4, rows: 5,
				frameRate: 10,
				range: [0, 10]
			}),
			pipe: await this.textureManager.createAtlas(7).setImage({
				url: "assets/pipe.png",
				collision_url: "assets/pipe-collision.png",
				cols: 4, rows: 5,
				frameRate: 10,
				range: [10]
			}),
			pipe_in: await this.textureManager.createAtlas(7).setImage({
				url: "assets/pipe.png",
				cols: 4, rows: 5,
				frameRate: 10,
				range: [11, 19]
			}),
			balloon0: await this.textureManager.createAtlas(2).setImage({
				url: "assets/balloon.png",
				collision_url: "assets/balloon-collision.png",
				cols: 3, rows: 3,
				range: [0],
			}),
			balloon1: await this.textureManager.createAtlas(2).setImage({
				url: "assets/balloon.png",
				collision_url: "assets/balloon-collision.png",
				cols: 3, rows: 3,
				range: [1],
			}),
			balloon2: await this.textureManager.createAtlas(2).setImage({
				url: "assets/balloon.png",
				collision_url: "assets/balloon-collision.png",
				cols: 3, rows: 3,
				range: [2],
			}),
			balloon3: await this.textureManager.createAtlas(2).setImage({
				url: "assets/balloon.png",
				collision_url: "assets/balloon-collision.png",
				cols: 3, rows: 3,
				range: [3],
			}),
			balloon4: await this.textureManager.createAtlas(2).setImage({
				url: "assets/balloon.png",
				collision_url: "assets/balloon-collision.png",
				cols: 3, rows: 3,
				range: [4],
			}),
			balloon5: await this.textureManager.createAtlas(2).setImage({
				url: "assets/balloon.png",
				collision_url: "assets/balloon-collision.png",
				cols: 3, rows: 3,
				range: [5],
			}),
			balloon6: await this.textureManager.createAtlas(2).setImage({
				url: "assets/balloon.png",
				collision_url: "assets/balloon-collision.png",
				cols: 3, rows: 3,
				range: [6],
			}),
			balloon7: await this.textureManager.createAtlas(2).setImage({
				url: "assets/balloon.png",
				collision_url: "assets/balloon-collision.png",
				cols: 3, rows: 3,
				range: [7],
			}),
			candy: await this.textureManager.createAtlas(3).setImage({
				url: "assets/candy.png",
				cols:3,rows:3,
				range:[0],
			}),
			chocolate: await this.textureManager.createAtlas(4).setImage({
				url: "assets/chocolate.png",
			}),
			still: await this.textureManager.createAtlas(0).setImage(
				{
					url: "assets/cheoni.png",
					collision_url: "assets/cheoni-collision.png",
					cols:8,rows:5,
					range:[0],
				}),
			walk: await this.textureManager.createAtlas(0).setImage(
				{
					url: "assets/cheoni.png",
					collision_url: "assets/cheoni-collision.png",
					cols:8,rows:5,
					frameRate:15,
					firstFrame: 3,
					range:[1, 6],
				}),
			down: await this.textureManager.createAtlas(0).setImage(
				{
					url: "assets/cheoni.png",
					collision_url: "assets/cheoni-collision.png",
					cols:8,rows:5,
					frameRate: 15,
					range:[8, 11],
				}),
			backup: await this.textureManager.createAtlas(0).setImage(
				{
					url: "assets/cheoni.png",
					collision_url: "assets/cheoni-collision.png",
					cols:8,rows:5,
					frameRate: 15,
					range:[16, 18],
				}),
			crawling: await this.textureManager.createAtlas(0).setImage(
				{
					url: "assets/cheoni.png",
					collision_url: "assets/cheoni-collision.png",
					cols:8,rows:5,
					frameRate: 12,
					range:[11, 14],
				}),
			crawled: await this.textureManager.createAtlas(0).setImage(
				{
					url: "assets/cheoni.png",
					collision_url: "assets/cheoni-collision.png",
					cols:8,rows:5,
					range:[11],
				}),
			jump: await this.textureManager.createAtlas(0).setImage(
				{
					url: "assets/cheoni.png",
					collision_url: "assets/cheoni-collision.png",
					cols:8,rows:5,
					frameRate:15,
					range:[19,32],
				}),
			pickup: await this.textureManager.createAtlas(0).setImage(
				{
					url: "assets/cheoni.png",
					collision_url: "assets/cheoni-collision.png",
					cols:8,rows:5,
					frameRate:5,
					range:[33, 34],
				}),
		};

		this.extra = 0;

		this.frameInfo = {
			airborn: {
				20:true,
				21:true,
				22:true,
				23:true,
				24:true,
				25:true,
				26:true,
				27:true,
				28:true,
				29:true,
			},
			jumping: {
				19:true,
				20:true,
				21:true,
				22:true,
				23:true,
				24:true,
				25:true,
				26:true,
				27:true,
				28:true,
				29:true,
				30:true,
				31:true,
			},
			crawling: {
				11:true,
				12:true,
				13:true,
				14:true,
			},
			backup: {
				16:true,
				17:true,
			},
			landing: {
				28:true,
				29:true,
			},
		};

		/* Load sprite */
		this.spriteCollection = new SpriteCollection();
		const [viewportWidth, viewportHeight] = this.config.viewport.size;

		this.background = this.spriteCollection.create({
			anim: this.atlas.background,
			size: [800, 400],
		});

		this.balloons = [
			this.spriteCollection.create({
				anim: this.atlas.balloon0,
				size: [128, 128],
				hotspot: [64,64],
				x: 100, y: 50,
			}),
			this.spriteCollection.create({
				anim: this.atlas.balloon1,
				size: [128, 128],
				hotspot: [64,64],
				x: 400, y: 50,
			}),
			this.spriteCollection.create({
				anim: this.atlas.balloon2,
				size: [128, 128],
				hotspot: [64,64],
				x: 700, y: 50,
			}),
		];

		this.cheoni = this.spriteCollection.create({
			x: 50, y: 282,
			size: [128, 256],
			hotspot: [64,256],
			anim: this.atlas.walk,
		});
		this.cheoni.dx = 0;

		this.flyingCandies = [];
		this.candies = [];
		for (let i = 0; i < 50; i++) {
			this.candies.push(this.spriteCollection.create({
				anim: this.atlas.candy,
				size: [64, 64],
				hotspot: [32,32],
				x: 100, y: 100,
				opacity: 0,
			}));
		}

		this.pipe = this.spriteCollection.create({
			anim: this.atlas.pipe_out,
			size: [128, 128],
			hotspot: [64,128],
			x: 100, y: 280,
			opacity: 0,
		});

		this.candies.forEach(candy => {
			candy.rotationSpeed = Math.random() -.5;
		});

		// this.gamemap = this.spriteCollection.create({
		// 	anim: this.atlas.gamemap,
		// 	size: [800, 400],
		// 	opacity: .2,
		// });

		/* Buffer renderer */
		this.bufferRenderer = new BufferRenderer(gl, this.config);
		this.spriteRenderer = new SpriteRenderer(this.bufferRenderer, this.shader, this.config.viewport.size);

		/* Setup constants */
		this.numInstances = 70;	//	Note: This shouldn't be constants. This is the number of instances.
		this.numVerticesPerInstance = 6;

		const keyboardHandler = new KeyboardHandler(document); 
		this.keyboardHandler = keyboardHandler;
		keyboardHandler.addKeyUpListener("Escape", e => {
			// const { state } = this;
			// state.sceneChangeStarting = state.time;
			// state.nextScene = "reset";
			// console.log(state.scene, "=>", state.nextScene);
		});

		/* Addd audio listener */
		keyboardHandler.addKeyUpListener("m", e => {
			const audio = document.getElementById("audio");
			this.setAudio(audio, audio.paused, .5);
		});

		//	Allow audio
		let f;
		keyboardHandler.addKeyDownListener(null, f = e => {
			//console.log(e.key);
			const audio = document.getElementById("audio");
			this.setAudio(audio, audio.paused, .5);
			keyboardHandler.removeListener(f);
		});

		keyboardHandler.addKeyDownListener("t", e => {
			this.test(this.lastTime);
		});

		// this.sceneMap = {
		// 	"base-+": "base",
		// 	"base+-": "base",
		// 	"base++-": "phase2",
		// 	"base--+": "phase2",
		// 	"phase2+-": "phase3",
		// 	"phase2-+": "phase3",
		// 	"phase3+-": "phase4",
		// 	"phase3-+": "phase4",
		// 	"phase4-": "phase4",
		// 	"phase4+-": "phase4+",
		// 	"phase4++-": "phase4++",
		// 	"phase4+++": "with-eva",
		// };

		console.log(gl);

		this.score = parseInt(localStorage.getItem("score") || 0);
		this.chocolate = parseInt(localStorage.getItem("chocolate") || 0);
		this.dinoCount = parseInt(localStorage.getItem("dino") || 0);

		this.resize(canvas, gl, config);

		this.lastTime = 0;

		this.initialize(gl, this.shader.uniforms, config);

		Engine.start(this);
	}

	setAudio(audio, value, volume) {
		if (value) {
			document.getElementById("speaker").innerText = "🔊";
			audio.play();
		} else {
			document.getElementById("speaker").innerText = "🔇";
			audio.pause();					
		}
	}

	// resetState(state) {
	// 	const [viewportWidth, viewportHeight] = this.config.viewport.size;
	// 	state = state || {};
	// 	for (let prop in state) {
	// 		delete state[prop];
	// 	}
	// 	state.scene = "base";
	// 	state.x = viewportWidth / 2;
	// 	state.y = viewportHeight / 2 + 114;
	// 	state.direction = 1;
	// 	state.evaDirection = 1;
	// 	document.getElementById("eva").style.transform = "";

	// 	if (localStorage.getItem("with-eva")) {
	// 		state.win = true;
	// 		state.scene = "with-eva";
	// 		state.x = 200;
	// 		setTimeout(() => {
	// 			document.getElementById("message-box").innerText = "Eva!";
	// 		}, 500);
	// 	}

	// 	document.getElementById("sexy").style.display = "none";
	// 	document.getElementById("elon").style.display = "none";
	// 	document.getElementById("police").style.display = "none";
	// 	document.getElementById("drug").style.display = "none";
	// 	document.getElementById("annie").style.display = "none";
	// 	document.getElementById("message-box").innerText = localStorage.getItem("lost-eva") ? "I lost Eva." : "";

	// 	return state;
	// }

	initialize(gl, uniforms, {viewport: {pixelScale, size: [viewportWidth, viewportHeight]}}) {
		this.bufferRenderer.setAttribute(this.shader.attributes.vertexPosition, 0, Utils.FULL_VERTICES);		
		gl.clearColor(.8, .8, .8, 1);

		const viewMatrix = mat4.fromTranslation(mat4.create(), vec3.fromValues(0, 0, 0));
		gl.uniformMatrix4fv(uniforms.view.location, false, viewMatrix);

		const zNear = -1;
		const zFar = 2000;
		const orthoMatrix = mat4.ortho(mat4.create(), -viewportWidth, viewportWidth, -viewportHeight, viewportHeight, zNear, zFar);		
		gl.uniformMatrix4fv(uniforms.ortho.location, false, orthoMatrix);
	}

	applyKeyboard(cheoni, keyboardHandler, time) {
		const { keys } = keyboardHandler;
		// if (!state.sceneChangeStarting && !state.foundEva) {
		const frame = cheoni.getAnimationFrame(time);
		const crouching = keys["ArrowDown"] || keys["s"];
		const crawling = crouching && this.frameInfo.crawling[frame];
		const backup = (this.frameInfo.crawling[frame] || this.frameInfo.backup[frame]) && !crouching;
		const jumping = keys[" "] || keys["Shift"] || keys["w"] || keys["ArrowUp"] || this.frameInfo.jumping[frame];
		cheoni.dx = (keys["ArrowLeft"] || keys["a"] ? -1 : 0) + (keys["ArrowRight"] || keys["d"] ? 1 : 0);

		const anim = backup ? this.atlas.backup
					: crawling ? (cheoni.dx !== 0 ? this.atlas.crawling : this.atlas.crawled)
					: jumping ? this.atlas.jump
					: crouching ? this.atlas.down
					: cheoni.dx !== 0 ? this.atlas.walk
					: this.atlas.still;
		if (cheoni.changeAnimation(anim, time)) {
			// const frameOffset = anim.firstFrame - anim.startFrame;
			// const frameDuration = 1000 / anim.frameRate;
			// console.log(time,- frameDuration * frameOffset, frameOffset);
			// cheoni.resetAnimation(time - frameDuration * frameOffset, time);
			cheoni.resetAnimation(time);
		}

		if (cheoni.dx !== 0) {
			cheoni.changeDirection(cheoni.dx, time);
		}

		// 	state.movement = dx !== 0 ? "running" : null;
		// 	if (dx !== 0) {
		// 		state.direction = dx;
		// 	}
		// }
	}

	// changeScene(time, state, nextScene) {
	// 	state.sceneChangeStarting = time;
	// 	state.nextScene = this.getNextScene(state.scene, state.x, state);
	// 	state.movement = 0;
	// 	console.log(state.scene, "=>", state.nextScene);

	// 	if (!state.audioTriggered) {
	// 		state.audioTriggered = true;

	// 		console.log("Starting audio.");
	// 		document.getElementById("audio").currentTime = null;
	// 		document.getElementById("audio").volume = .3;
	// 		document.getElementById("audio").play();
	// 	}
	// }

	// shouldMove(state, viewportWidth) {
	// 	const dist = Math.abs(state.x - viewportWidth / 2);
	// 	return state.movement || dist <= 30 || (dist >= 40 && dist < 100);
	// }

	applyMovement(cheoni, dt, time) {
		// if (!state.sceneChangeStarting) {
		// 	const dirDist = state.x - viewportWidth / 2;
		// 	if (this.shouldMove(state, viewportWidth)) {
		const mul = 2;
		const frame = cheoni.getAnimationFrame(time);
		const airborn = this.frameInfo.airborn[frame];
		const crawling = this.frameInfo.crawling[frame];
		dt = Math.min(dt, 20);
		let px = cheoni.x;
		if (cheoni.anim === this.atlas.walk) {
			px = cheoni.x + dt * cheoni.dx / 6 * mul;
		} else if (crawling) {
			px = cheoni.x + dt * cheoni.dx / 10 * mul;
		} else if (airborn) {
			px = cheoni.x + dt * cheoni.dx / 4 * mul;
		}
		px = Math.max(20, Math.min(px, 800 - 20));
		cheoni.changePosition(px, cheoni.y, time);
		// 		if (state.x < 0) {
		// 			this.changeScene(time, state, this.getNextScene(state.scene, state.x, state));
		// 		} else if (state.x > viewportWidth) {
		// 			this.changeScene(time, state, this.getNextScene(state.scene, state.x, state));
		// 		}
		// 		if (this.timeout) {
		// 			clearTimeout(this.timeout);
		// 			clearTimeout(this.timeout2)
		// 			this.timeout = 0;
		// 			this.timeout2 = 0;
		// 			document.getElementById("eva").src = "assets/eva.gif";
		// 		}
		// 	} else if(!this.timeout) {
		// 		const dist = Math.abs(dirDist);
		// 		if (dist > 30 && dist < 50 && !this.timeout) {
		// 			console.log(dist);
		// 			this.timeout = setTimeout(() => {
		// 				if (dirDist * state.direction < 0) {
		// 					document.getElementById("eva").src = "assets/eva-2.gif";
		// 				}
		// 			}, 500);

		// 			if (state.win) {
		// 				this.timeout2 = setTimeout(() => {
		// 					if (dirDist * state.direction < 0) {
		// 						state.foundEva = true;
		// 						const img = new Image();
		// 						img.addEventListener("load", () => {
		// 							state.hideSelf = true;
		// 							document.getElementById("eva").src = img.src;
		// 						});
		// 						img.src = "assets/hug.gif";
		// 						document.getElementById("message-box").innerText = "";
		// 						localStorage.removeItem("with-eva");
		// 						this.winEva(state);
		// 					}
		// 				}, 3000);
		// 			}
		// 		}
		// 	}
		// 	if (Math.random() < .05 && !state.evaTurning) {
		// 		if (state.evaDirection * dirDist < 0) {
		// 			state.evaDirection = dirDist;
		// 			state.evaTurning = true;
		// 			document.getElementById("eva").src = "assets/eva-turn.gif";
		// 			const finalDir = dirDist;
		// 			setTimeout(() => {
		// 				document.getElementById("eva").src = "assets/eva.gif";
		// 				document.getElementById("eva").style.transform = `scaleX(${finalDir < 0 ? -1 : 1})`;
		// 				state.evaTurning = false;
		// 			}, 450);
		// 		}
		// 	}
		// }		
	}

	moveBalloon(balloon, index, time, dt) {
		const newBaloon = balloon.x < -64;
		if (newBaloon) {
			balloon.changeOpacity(1, time);
			balloon.popped = 0;
			const colorIndex = Math.floor(Math.random() * (this.extra ? 8 : 7));
			if (this.extra && colorIndex === 7) {
				this.extra --;
			}
			balloon.changeAnimation(this.atlas["balloon" + colorIndex], time);
		}
		const px = (newBaloon ? balloon.x + 1000 : balloon.x) - dt * .2;
		balloon.changePosition(px, 20 + 40 * Math.sin((time + index * 3333) / 500), time);
//		balloon.changePosition(balloon.x, 200, time)
	}

	doCollide(sprite1, sprite2, time) {
		const box1 = sprite1.getCollisionBox(time);
		const box2 = sprite2.getCollisionBox(time);
		if (!box1 || !box2) {
			return false;
		}
		return box1.right >= box2.left && box2.right >= box1.left && box1.bottom >= box2.top && box2.bottom >= box1.top;
	}

	checkBalloon(balloon, cheoni, time) {
//		console.log(balloon.popped, this.doCollide(balloon, cheoni, time));
		if (!balloon.popped && this.doCollide(balloon, cheoni, time)) {
			balloon.popped = time;
			balloon.changeOpacity(0, time);
			document.getElementById("hit-audio").play();
			// document.getElementById("info-box").innerText = "POP";//this.cheoni.getAnimationFrame(time);
//			console.log("POP");
			this.dropCandy(balloon.x, balloon.y, balloon.anim === this.atlas.balloon7, false, time);
			this.dropCandy(balloon.x, balloon.y, false, true, time);
			this.dropCandy(balloon.x, balloon.y, false, true, time);
			this.dropCandy(balloon.x, balloon.y, false, true, time);
			this.dropCandy(balloon.x, balloon.y, false, true, time);
			this.dropCandy(balloon.x, balloon.y, false, true, time);
			this.dropCandy(balloon.x, balloon.y, false, true, time);
			this.dropCandy(balloon.x, balloon.y, false, true, time);
			this.dropCandy(balloon.x, balloon.y, false, true, time);
			this.dropCandy(balloon.x, balloon.y, false, true, time);
		} else {
			// document.getElementById("info-box").innerText = "NOPOP";//this.cheoni.getAnimationFrame(time);
		}

	}

	dropCandy(x, y, dino, sparkle, time) {
		const candy = this.candies.pop();
		if (candy) {
			candy.changePosition(x, y, time);
			candy.x = x;
			candy.y = y;
			candy.changeOpacity(sparkle ? .3 : 1, time);
			candy.dx = (Math.random() - .5) * 20;
			candy.dy = -5 + 10 * Math.random();

			candy.changeAnimation(sparkle ? this.atlas.sparkle : dino ? this.atlas.dino : Math.random() < .3 ? this.atlas.chocolate : this.atlas.candy, time);

			//console.log(candy);
			this.flyingCandies.push(candy);
		}
	}

	processPipe(time) {
		if (this.pipe.show) {
			if (this.pipe.opacity === 0) {
				this.pipe.changePosition(Math.random() * 600 + 100, this.pipe.y, time);
				this.pipe.changeOpacity(1, time);
				this.pipe.changeAnimation(this.atlas.pipe_out, time);
			} else if (this.pipe.anim === this.atlas.pipe_out) {
				const frame = this.pipe.getAnimationFrame(time);
				if (frame === 10) {
					this.pipe.changeAnimation(this.atlas.pipe, time);
				}
			} else if (this.pipe.anim === this.atlas.pipe) {
				const cheoniFrame = this.cheoni.getAnimationFrame(time);
				if (this.frameInfo.landing[cheoniFrame] && Math.abs(this.cheoni.x - this.pipe.x) < 50) {
					this.pipe.changeAnimation(this.atlas.pipe_in, time);
//					this.cheoni.changeAnimation(this.atlas.jump,)
				}
			} else if (this.pipe.anim === this.atlas.pipe_in) {
				const frame = this.pipe.getAnimationFrame(time);
				if (frame === 19) {
					this.pipe.changeOpacity(0, time);
					this.pipe.show = false;
				}
			}
		}
	}

	processCandies(dt, time) {
		const crawling = this.cheoni.anim === this.atlas.crawling;
		for (let i = this.flyingCandies.length - 1; i >= 0; i--) {
			const candy = this.flyingCandies[i];
			if (candy.landed) {
				const frame = this.cheoni.getAnimationFrame(time);
				const crawling = this.frameInfo.crawling[frame];

				if (crawling && Math.abs(this.cheoni.x - candy.x) < 50) {
					candy.landed = false;
					this.flyingCandies[i] = this.flyingCandies[this.flyingCandies.length - 1];
					this.flyingCandies.pop();
					this.candies.push(candy);
					candy.changeOpacity(0, time);
					const pickupAudio = document.getElementById("pickup-audio");
//					this.cheoni.changeAnimation(this.atlas.pickup, time);
					pickupAudio.currentTime = 0;
					pickupAudio.play();
					if (this.atlas.dino === candy.anim) {
						this.dinoCount ++;
					} else {
						const count = this.score + this.chocolate;
						if (this.atlas.chocolate === candy.anim) {
							this.chocolate ++;						
						} else {
							this.score ++;
						}
						if (count % 10 === 0) {
							this.extra++;
						}
					}


					document.getElementById("score").innerText = this.score ? "🍬: " + this.score + " " : "";
					localStorage.setItem("score", this.score);
					document.getElementById("chocolate").innerText = this.chocolate ? "🍫: " + this.chocolate + " " : "";
					localStorage.setItem("chocolate", this.chocolate);
					document.getElementById("dino").innerText = this.dinoCount ? "🦖: " + this.dinoCount + " " : "";
					localStorage.setItem("dino", this.dinoCount);

				}

				continue;
			}
			candy.changeRotation(candy.rotation + dt * 10 * candy.rotationSpeed, time);

			const px = Math.max(50, Math.min(800-50, candy.x + candy.dx));
			const py = candy.y + candy.dy;
			candy.dy += .3;
			if (px <= 50 || px >= 800 - 50) {
				candy.dx = -candy.dx;
			}
			candy.changePosition(px, py, time);
			if (candy.y >= 282) {
				candy.landed = true;
				if (candy.anim === this.atlas.dino) {
					candy.changeRotation(0, time);
				} else if (candy.anim === this.atlas.sparkle) {
					this.flyingCandies[i] = this.flyingCandies[this.flyingCandies.length - 1];
					this.flyingCandies.pop();
					this.candies.push(candy);
					candy.changeOpacity(0, time);
					candy.landed = false;
				}
 			}
		}
	}

	checkCollisions(time) {
		if (this.doCollide(this.pipe, this.cheoni, time)) {
//			const dx = 
		}
	}

	test(time) {
		this.checkBalloon(this.balloons[0], this.cheoni, time);
		// const cheoniRect = this.cheoni.anim.getCollisionBox(this.cheoni.getAnimationFrame(time));
		// const balloonRect = this.balloons[0].anim.getCollisionBox(this.balloons[0].getAnimationFrame(time));
		// console.log(cheoniRect, balloonRect);
	}

	// applySceneChange(state, time) {
	// 	const { gl } = this;
	// 	const [viewportWidth, viewportHeight] = this.config.viewport.size;
	// 	state.time = time;
	// 	const colorMultiplier = state.gameOver ? .2 : 1;
	// 	const color = .8 * colorMultiplier;
	// 	if (state.sceneChangeStarting) {
	// 		const progress = (time - state.sceneChangeStarting) / 2000;
	// 		if (progress < .3) {
	// 			const fadeProgress = Math.max(0, (.3 - progress) / .3) * colorMultiplier;
	// 			gl.clearColor(.8 * fadeProgress, .8 * fadeProgress, .8 * fadeProgress, 1);
	// 		} else if (progress >= .8) {
	// 			state.sceneChangeStarting = 0;
	// 			gl.clearColor(color, color, color, 1);		
	// 		} else if (progress > .7) {
	// 			const fadeProgress = Math.min(1, (progress - .7) / .3) * colorMultiplier;
	// 			gl.clearColor(.8 * fadeProgress, .8 * fadeProgress, .8 * fadeProgress, 1);				
	// 		} else if (progress >= .5 && state.nextScene) {
	// 			state.scene = state.nextScene;
	// 			if (this.sceneMap[state.scene]) {
	// 				state.scene = this.sceneMap[state.scene];
	// 			}
	// 			console.log("scene: ", state.scene);
	// 			if (state.win) {
	// 				state.win = false;
	// 				state.gameOver = state.scene !== "reset";			
	// 			}

	// 			state.nextScene = null;
	// 			state.x = state.x < viewportWidth / 2 ? 700 : 100;
	// 			if (!state.win) {
	// 				if (state.scene !== "reset") {
	// 					document.getElementById("eva").style.display = "none";
	// 					localStorage.setItem("lost-eva", true);
	// 				}
	// 				localStorage.removeItem("with-eva");
	// 			}
	// 			document.getElementById("controls").style.display = "none";
	// 			if (state.scene !== "reset") {
	// 				setTimeout(() => {
	// 					document.getElementById("message-box").innerText = this.getMessage(state.scene, state);
	// 				}, 500);
	// 			}
	// 			this.onScene(state.scene, state);
	// 		}
	// 	}
	// }

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

	showDebugCanvas(time) {
		this.debugCanvas.width = this.canvas.width;
		this.debugCanvas.height = this.canvas.height;
		this.debugCanvas.style.width = `${this.canvas.offsetWidth}px`;
		this.debugCanvas.style.height = `${this.canvas.offsetHeight}px`;
		this.debugCanvas.style.left = `${this.canvas.offsetLeft}px`;
		this.debugCanvas.style.top = `${this.canvas.offsetTop}px`;
		this.debugCanvas.style.display = "";
		const ctx = this.debugCtx;
		ctx.clearRect(0, 0, this.debugCanvas.width, this.debugCanvas.height);
		ctx.beginPath();
		ctx.rect(5, 5, this.debugCanvas.width - 10, this.debugCanvas.height - 10);
		ctx.stroke()

		const { cheoni } = this;
		ctx.strokeStyle = "#FF0000";
		ctx.beginPath();


		for (let i = 0; i < this.spriteCollection.size(); i++) {
			const sprite = this.spriteCollection.get(i);
			this.drawCollisionBox(ctx, sprite, time);
		}

		ctx.stroke();

	}

	drawCollisionBox(ctx, sprite, time) {
		const rect = sprite.getCollisionBox(time);
		if (!rect) {
			return;
		}
		ctx.rect(rect.left, rect.top, rect.right - rect.left + 1, rect.bottom - rect.top + 1);
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
		this.applyKeyboard(this.cheoni, this.keyboardHandler, time);
		this.applyMovement(this.cheoni, dt, time);

		for (let i = 0; i < this.balloons.length; i++) {
			this.moveBalloon(this.balloons[i], i, time, dt);
			this.checkBalloon(this.balloons[i], this.cheoni, time);
		}

		this.checkCollisions(time);

		this.processCandies(dt, time);
		this.processPipe(time);

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
		this.showDebugCanvas(time);
	}
}

const engine = new Engine(globalData.config);