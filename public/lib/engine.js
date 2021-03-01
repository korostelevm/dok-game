class Engine {
	constructor(config) {
		this.localhost = location.host.startsWith("localhost:") || location.host.startsWith("dobuki.tplinkdns.com");
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
		this.chrono = new Chrono();

		if (config.viewport.pixelScale < 1 && !this.isRetinaDisplay()) {
			config.viewport.pixelScale = 1;
		}

		this.chrono.tick("init");
		console.log(config);
		const maxInstancesCount = 1000;
		console.log("maxInstancesCount", maxInstancesCount);
		await this.loadDomContent(document);
		console.log("Starting engine...");
		const canvas = document.getElementById("canvas");
		if (!canvas) {
			console.error("You need a canvas with id 'canvas'.");
		}
		this.canvas = canvas;
		const gl = canvas.getContext("webgl", config.webgl) || canvas.getContext("experimental-webgl", config.webgl);
		this.gl = gl;
		this.chrono.tick("dom content loaded");

		this.debugCanvas = document.createElement("canvas");
		this.debugCanvas.style.position = "absolute";
		this.debugCanvas.zIndex = 1;
		document.body.appendChild(this.debugCanvas);
		this.debugCtx = this.debugCanvas.getContext("2d");
		this.debugCanvas.style.display = "none";

		this.overlay = document.getElementById("overlay");

		/* Focus Fixer */
		this.focusFixer = new FocusFixer(canvas);	

		/* Prototypes */
		this.setupPrototypes();

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
		this.textureManager = new TextureManager(gl, this.shader.uniforms, new ImageLoader(), this.chrono);

		/* Load sprite */
		this.spriteCollection = new SpriteCollection();

		/* Buffer renderer */
		this.bufferRenderer = new BufferRenderer(gl, config);
		this.spriteRenderer = new SpriteRenderer(this.bufferRenderer, this.shader, this.config.viewport.size);

		/* Keyboard handler */
		this.keyboardHandler = new KeyboardHandler(document);

		/* Setup constants */
		this.numInstances = 30;	//	Note: This shouldn't be constants. This is the number of instances.
		console.log("numInstances", 30);
		this.numVerticesPerInstance = 6;

		this.resize(canvas, gl, config);
		this.initialize(gl, this.shader.uniforms, config);

		this.voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
		//console.log(this.voices);

//		this.game = null;

		this.lastTime = 0;
		if (this.game) {
			this.chrono.tick("game init");
			await game.init(this);
			this.chrono.tick("game init done");
		}
		this.ready = true;
		Engine.start(this);
		this.chrono.tick("engine started");
	}

	async setGame(game) {
		this.game = game;
		if (this.ready) {
			this.chrono.tick("game init");
			await this.game.init(this);
			this.chrono.tick("game init done");
		}
	}

	setupPrototypes() {
		String.prototype.contains = Array.prototype.contains = function(str) {
			return this.indexOf(str) >= 0;
		};
		Array.prototype.remove = function(str) {
			this.splice(this.indexOf(str), 1);
		};		
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

	pointContains(x, y, collisionBox) {
		const px = x, py = y;
		return collisionBox.left <= px && px <= collisionBox.right && collisionBox.top <= py && py <= collisionBox.bottom;
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
		const loop = (time) => {
			engine.refresh(time);
		  	requestAnimationFrame(loop);
		};
		loop(0);
	}

	doCollide(box1, box2, time) {
		if (!box1 || !box2) {
			return false;
		}
		return box1.right >= box2.left && box2.right >= box1.left && box1.bottom >= box2.top && box2.bottom >= box1.top;
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
		const rect = sprite.opacity > 0 ? sprite.getCollisionBox(time) : null;
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

	bestVoice(voices, voiceName) {
		if (!this.voiceReplacements) {
			this.voiceReplacements = {};
		}
		if (this.voiceReplacements[voiceName]) {
			return this.voiceReplacements[voiceName];
		}
		for (let i = 0; i < voices.length; i++) {
			if (voices[i].lang.startsWith("en")) {
				return this.voiceReplacements[voiceName] = voices[i];
			}
		}
		return this.voiceReplacements[voiceName] = voices[Math.floor(Math.random() * voices.length)];
	}

	getUterrance(msg, voiceName) {
		if (!window.speechSynthesis) {
			return null;
		}
		if (!this.voices || !this.voices.length) {
			this.voices = window.speechSynthesis.getVoices();
		}

		const voices = this.voices;
		const voiceNames = Array.isArray(voiceName) ? voiceName : [voiceName];
		let voice = null;
		let lowestIndex = voices.length - 1;
		for (let i = 0; i < voices.length; i++) {
			const index = voiceNames.indexOf(voices[i].name);
			if (index >= 0 && index < lowestIndex) {
				voice = voices[i];
				lowestIndex = index;
			}
		}
		if (!voice) {
			voice = this.bestVoice(this.voices, voiceNames[0]);
		}
		if (!voice) {
			return null;
		}

		if (!this.utterrances) {
			this.utterrances = {};
		}
		if (!this.utterrances[voice.name]) {
			this.utterrances[voice.name] = new SpeechSynthesisUtterance();
			this.utterrances[voice.name].voice = voice;
			console.log(voice);
		}
		const utterance = this.utterrances[voice.name];
		utterance.text = msg;
		return utterance;
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

		this.handleFrames(time);

		const { game } = this;
		if (game && game.ready) {
			game.refresh(time, dt);
		}

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

		//	DRAW CALL
		ext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, this.numVerticesPerInstance, this.numInstances);
		this.lastTime = time;
		if (this.localhost) {
			this.showDebugCanvas(time);
		}
	}
}

const engine = new Engine(globalData.config);