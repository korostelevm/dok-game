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

		/* Init times. */
		this.time = 0;

		/* Config shader */
		this.configShader(gl);

		/* Initialize Shader program */
		const { vertexShader, fragmentShader, attributes } = globalData;
		this.shader = new Shader(gl, ext, vertexShader, fragmentShader, attributes, maxInstancesCount);

		/* Texture management */
		this.imageLoader = new ImageLoader();
		this.textureManager = new TextureManager(gl, this.shader.uniforms, this.imageLoader);

		/* Load image */
		const cheoniAtlas = await this.textureManager.createAtlas(0).setImage("assets/cheoni.png", {cols:7,rows:4,totalFrames:28,frameRate:8});

		/* Load sprite */
		this.spriteCollection = new SpriteCollection();
		const [viewportWidth, viewportHeight] = this.config.viewport.size;
		this.cheoni = this.spriteCollection.create({
			size: [64, 128],
			anim: cheoniAtlas,
		});

		/* Buffer renderer */
		this.bufferRenderer = new BufferRenderer(gl, this.config);
		this.spriteRenderer = new SpriteRenderer(this.bufferRenderer, this.shader, this.config.viewport.size);

		/* Setup constants */
		this.numInstances = 2;	//	Note: This shouldn't be constants. This is the number of instances.
		this.numVerticesPerInstance = 6;

//		this.state = this.resetState();

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
			// const audio = document.getElementById("audio");
			// if (audio.paused) {
			// 	document.getElementById("controls").innerText = "⬅️➡️: move. ESC: Restart game. M: 🔊";
			// 	audio.play();
			// } else {
			// 	document.getElementById("controls").innerText = "⬅️➡️: move. ESC: Restart game. M: 🔇";
			// 	audio.pause();					
			// }
		});

		//	Allow audio
		let f;
		keyboardHandler.addKeyDownListener(null, f = e => {
			// const audio = document.getElementById("audio");
			// audio.volume = 0;
			// audio.play();
			// keyboardHandler.removeListener(f);
		});

		keyboardHandler.addKeyDownListener(" ", e => {
			console.log("SPACE ", this.time);
//			this.cheoni.resetAnimation(this.time);
//			this.cheoni.changeOpacity(1 - this.cheoni.opacity, this.lastTime);
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

		this.resize(canvas, gl, config);

		this.lastTime = 0;

		this.initialize(gl, this.shader.uniforms, config);

		Engine.start(this);
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

	applyKeyboard(cheoni, keyboardHandler) {
		const { keys } = keyboardHandler;
		// if (!state.sceneChangeStarting && !state.foundEva) {
		const dx = (keys["ArrowLeft"] || keys["a"] ? -1 : 0) + (keys["ArrowRight"] || keys["d"] ? 1 : 0);

		if (dx !== 0) {
			cheoni.changeDirection(dx, this.lastTime);
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

	applyMovement(state, dt, time, viewportWidth) {
		// if (!state.sceneChangeStarting) {
		// 	const dirDist = state.x - viewportWidth / 2;
		// 	if (this.shouldMove(state, viewportWidth)) {
		// 		dt = Math.min(dt, 20);
		// 		state.x += dt * state.direction / 2;
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

	refresh(time) {
		const dt = time - this.lastTime;
		this.time = time;
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
		this.applyKeyboard(this.cheoni, this.keyboardHandler);
		this.applyMovement(state, dt, time, viewportWidth);

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
				const {anim, direction, opacity} = sprite;
				this.spriteRenderer.setAnimation(i, anim, direction, opacity);
			}
			if (sprite.updated.updateTime >= this.lastTime) {
				this.spriteRenderer.setUpdateTime(i, sprite.updated);
			}
		}

		//	DRAW CALL
		ext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, this.numVerticesPerInstance, this.numInstances);
		this.lastTime = time;
	}
}

const engine = new Engine(globalData.config);