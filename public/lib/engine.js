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

		/* Config shader */
		this.configShader(gl);

		/* Initialize Shader program */
		const { vertexShader, fragmentShader, attributes } = globalData;
		this.shader = new Shader(gl, ext, vertexShader, fragmentShader, attributes, maxInstancesCount);

		/* Texture management */
		this.imageLoader = new ImageLoader();
		this.textureManager = new TextureManager(gl, this.shader.uniforms, this.imageLoader);

		/* Load image */
		const still = await this.textureManager.createAtlas(0).setImage("assets/dude-still.png", {cols:2,rows:2,frameRate:8});
		const run = await this.textureManager.createAtlas(1).setImage("assets/dude-run.png", {cols:2,rows:2,frameRate:15});
		const background = await this.textureManager.createAtlas(2).setImage("assets/background.png");
		this.atlas = { still, run, background };

		/* Buffer renderer */
		this.bufferRenderer = new BufferRenderer(gl);

		/* Setup constants */
		this.numInstances = 2;	//	Note: This shouldn't be constants. This is the number of instances.
		this.numVerticesPerInstance = 6;

		this.state = {
			scene: "base",
			x: 0,
			gameOver: false,
		};
		this.addKeyListeners(document, this.state);

		this.sceneMap = {
			"base-+": "base",
			"base+-": "base",
			"base++-": "phase2",
			"base--+": "phase2",
			"phase2+-": "phase3",
			"phase2-+": "phase3",
			"phase3+-": "phase4",
			"phase3-+": "phase4",
			"phase4-": "phase4",
			"phase4+-": "phase4+",
			"phase4++-": "phase4++",
		};

		this.resize(canvas, gl, config);

		this.lastTime = 0;
		Engine.start(this);
	}

	addKeyListeners(document, state) {
		document.addEventListener("keydown", e => {
			if (!state.sceneChangeStarting) {
				state.movement = "running";
				if (e.key === "ArrowLeft" || e.key === "a") {
					state.direction = -1;
				} else if (e.key === "ArrowRight" || e.key === "d") {
					state.direction = 1;
				}
			}
		});
		document.addEventListener("keyup", e => {
			state.movement = null;
		});
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
  		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	}

	static start(engine) {
		function loop(time) {
		  	requestAnimationFrame(loop);
			engine.refresh(time);
		}
		loop(0);
	}

	makeFullScreenCoordinates() {
		return new Float32Array(Utils.makeVertexArray(
			    [ -1, -1 ],
			    [  1, -1 ],
			    [ -1,  1 ],
			    [  1,  1 ],
		));
	}

	makeSpriteCoordinatesAtCenter(x, y, width, height) {
		const {viewport: {pixelScale, size: [viewportWidth, viewportHeight]}} = this.config;
		const x0 = (x - width / 2) / viewportWidth / pixelScale;
		const x1 = (x + width / 2) / viewportWidth / pixelScale;
		const y0 = (y - height / 2) / viewportHeight / pixelScale;
		const y1 = (y + height / 2) / viewportHeight / pixelScale;

		return new Float32Array(Utils.makeVertexArray(
			    [ x0, y0 ],
			    [ x1, y0 ],
			    [ x0, y1 ],
			    [ x1, y1 ],
		));
	}

	getNextScene(scene, direction, state) {
		if (state.gameOver || state.win) {
			return scene;
		}
		if (scene.startsWith("inter-")) {
			const sceneBase = scene.split("inter-")[1];
			return direction < 0 ? sceneBase + "-" : sceneBase;
		}
		if (scene.startsWith("inter+")) {
			const sceneBase = scene.split("inter+")[1];
			return direction >= 0 ? sceneBase + "+" : sceneBase;
		}
		return "inter" + (direction < 0 ? "-" : "+") + scene;
	}

	onScene(scene, state) {
		document.getElementById("sexy").style.display = "none";
		document.getElementById("elon").style.display = "none";
		document.getElementById("police").style.display = "none";
		document.getElementById("drug").style.display = "none";
		document.getElementById("annie").style.display = "none";
		switch(scene) {
			case "phase3-":
				document.getElementById("annie").style.display = "";
				break;
			case "phase2-":
				document.getElementById("police").style.display = "";
				break;
			case "phase2+":
				document.getElementById("drug").style.display = "";
				break;
			case "base--":
				document.getElementById("sexy").style.display = "";
				break;
			case "base++":
				document.getElementById("elon").style.display = "";
				break;
			case "phase4+++":
				document.getElementById("eva").style.display = "";
				state.win = true;
				break;
			case "inter-base--":
			case "inter+base++":
			case "inter-phase2-":
			case "inter+phase2+":
			case "inter-phase3-":
			case "inter+phase3+":
				state.gameOver = true;
				break;
			default:
				break;
		}
	}

	getMessage(scene, state) {
		if (state.gameOver) {
			return "You lost Eva.";			
		}
		switch(scene) {
			case "base":
				return "I lost Eva. I must find her...";
			case "base+":
				return "Where did Eva go? Right direction?...";
			case "base-":
				return "Where did Eva go? Left direction?...";
			case "base--":
				return "Hello handsome man! care to join me for some fun?";
			case "inter-base--":
				return "You spent some time with Tina, before looking for Eva. You never found her ever again.";
			case "base++":
				return "Hi. I'm Elon Musk. Would you like to work for me? Come in and fill out an application.";
			case "inter+base++":
				return "You applied for a job at Tesla, then pursued your research. But Eva was never found.";
			case "phase2":
				return "I'm lost... Where could have she gone?";
			case "phase2-":
				return "Lost someone? Sure, come to the police station. You can file a report.";
			case "inter-phase2-":
				return "After filing a report, you waited and waited... Still no sign of Eva.";
			case "phase2+":
				return "Don't worry buddy, your little lady is gonna come around. Come join us, how'bout some drugs?...";
			case "inter+phase2+":
				return "You lost yourself in drugs and drown your memories of Eva in alcohol.";
			case "phase3":
				return "I won't let anyone distract me. I must find Eva!";
			case "phase3-":
				return "Oh Adam! It's me, Annie! Wow, you haven't changed a bit since high school...";
			case "inter-phase3-":
				return "You reconnected with Annie, remembering the good times. Then continued your search.";
			case "phase3+":
				return "Adam... This is the voice of God. Go forth and you shall find what you are looking for.";
			case "inter+phase3+":
				return "You moved forward towards your faith... and found God!";
			case "phase4":
				return "Where can she possibly be?";
			case "phase4+":
				return "Oh Eva, will I ever see you again?";
			case "phase4++":
				return "I will never stop until I find you.";
			case "phase4+++":
				return "Eva!";
			default:
		}
		return "";
	}

	refresh(time) {
		const dt = time - this.lastTime;
		this.lastTime = time;
		if (!this.focusFixer.focused) {
			return;
		}

		const { gl, ext } = this;
		const {viewport} = this.config;
		const [viewportWidth, viewportHeight] = viewport.size;

		gl.uniform1f(this.shader.uniforms.time.location, time);

		const { state } = this;
		const colorMultiplier = state.gameOver ? .2 : 1;
		const color = .8 * colorMultiplier;
		if (state.sceneChangeStarting) {
			const progress = (time - state.sceneChangeStarting) / 2000;
			if (progress < .3) {
				const fadeProgress = Math.max(0, (.3 - progress) / .3) * colorMultiplier;
				gl.clearColor(.8 * fadeProgress, .8 * fadeProgress, .8 * fadeProgress, 1);
			} else if (progress >= .8) {
				state.sceneChangeStarting = 0;
				gl.clearColor(color, color, color, 1);		
			} else if (progress > .7) {
				const fadeProgress = Math.min(1, (progress - .7) / .3) * colorMultiplier;
				gl.clearColor(.8 * fadeProgress, .8 * fadeProgress, .8 * fadeProgress, 1);				
			} else if (progress >= .5 && state.nextScene) {
				state.scene = state.nextScene;
				if (this.sceneMap[state.scene]) {
					state.scene = this.sceneMap[state.scene];
				}
				console.log("scene: ", state.scene);

				state.nextScene = null;
				state.x = state.x < 0 ? 300 : -300;
				if (!state.win) {
					document.getElementById("eva").style.display = "none";
				}
				document.getElementById("message-box").innerText = this.getMessage(state.scene, state);
				this.onScene(state.scene, state);
			}
		} else {
			gl.clearColor(color, color, color, 1);
		}

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		if (!state.sceneChangeStarting) {
			if (state.movement) {
				state.x += dt * state.direction / 2;
				if (state.x < -viewportWidth / 2) {
					state.sceneChangeStarting = time;
					state.nextScene = this.getNextScene(state.scene, state.x, state);
					console.log(state.scene, "=>", state.nextScene);
				} else if (state.x > viewportWidth / 2) {
					state.sceneChangeStarting = time;
					state.nextScene = this.getNextScene(state.scene, state.x, state);
					console.log(state.scene, "=>", state.nextScene);
				}

				if (Math.random() < .05) {
					document.getElementById("eva").style.transform = `scaleX(${state.x < 0 ? -1 : 1})`;
				}
			}
		}

		this.bufferRenderer.setAttribute(this.shader.attributes.position, 0,
			this.makeSpriteCoordinatesAtCenter(this.state.x, -50, 128, 128)
		);

		this.bufferRenderer.setAttribute(this.shader.attributes.vertexPosition, 0, this.makeFullScreenCoordinates());

		const anim = this.state.movement ? this.atlas.run : this.atlas.still;
		this.bufferRenderer.setAttribute(this.shader.attributes.textureIndex, 0, new Uint8Array([anim.index]));
		this.bufferRenderer.setAttribute(this.shader.attributes.textureCoordinates, 0,
			anim.getTextureCoordinatesAtTime(time, this.state.direction));

		//	DRAW CALL
		ext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, this.numVerticesPerInstance, this.numInstances);

//		console.log(time);
	}
}

const engine = new Engine(config);