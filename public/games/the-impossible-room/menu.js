class Menu extends GameBase {
	async init(engine, gameName) {
		await super.init(engine, gameName);

		const { config } = engine;

		/* Load Audio */
		this.audio = {
			...this.audio,
		};

		this.atlas = {
			...this.atlas,
			menu: await engine.addTexture({
				url: "assets/menu.png",
				// texture_url: "assets/skin-texture.jpg",
				// texture_blend: "luminosity",
				// texture_alpha: .3,
			}),
			mute: await engine.addTexture({
				url: "assets/menu-select.png",
				collision_url: "assets/menu-select.png",
				cols: 2, rows: 3,
				range: [0],
			}),
			unmute: await engine.addTexture({
				url: "assets/menu-select.png",
				collision_url: "assets/menu-select.png",
				cols: 2, rows: 3,
				range: [1],
			}),
			customize: await engine.addTexture({
				url: "assets/menu-select.png",
				collision_url: "assets/menu-select.png",
				cols: 2, rows: 3,
				range: [2],
			}),
			load: await engine.addTexture({
				url: "assets/menu-select.png",
				collision_url: "assets/menu-select.png",
				cols: 2, rows: 3,
				range: [3],
			}),
			start: await engine.addTexture({
				url: "assets/menu-select.png",
				collision_url: "assets/menu-select.png",
				cols: 2, rows: 3,
				range: [4],
			}),
		};

		const [viewportWidth, viewportHeight] = config.viewport.size;
		this.spriteFactory.create({
			anim: this.atlas.menu,
			size: [800, 400],
		});
		this.speaker = this.spriteFactory.create({
			anim: this.atlas.mute,
			size: [800, 400],
			opacity: .7,
		}, {
			onClick: () => {
				const audio = document.getElementById("audio");
				this.setAudio(audio, audio.paused, .5);
				this.speaker.changeAnimation(!audio.paused ? this.atlas.mute : this.atlas.unmute, this.engine.lastTime);
			},
		});
		this.customize = this.spriteFactory.create({
			anim: this.atlas.customize,
			opacity: 0,
			size: [800, 400],
		}, { 
			onClick: () => {
				this.engine.setGame(new Selection());
			},		
		});
		this.load = this.spriteFactory.create({
			anim: this.atlas.load,
			opacity: 0,
			size: [800, 400],
		});
		this.start = this.spriteFactory.create({
			anim: this.atlas.start,
			opacity: 0,
			size: [800, 400],
		}, { 
			onClick: () => {
				this.engine.setGame(new Entrance());			
			},
		});
	}

	setAudio(audio, value, volume, ignore) {
		if (value) {
			document.getElementById("speaker").innerText = "🎵";
			document.getElementById("mute").innerText = "mute music";
			audio.play();
		} else {
			audio.pause();
			document.getElementById("speaker").innerText = "🚫🎵";
			document.getElementById("mute").innerText = "unmute music";
		}
		audio.volume = volume;
	}

	handleMouse(e) {
		super.handleMouse(e);
		if (!this.ready) {
			return;
		}
		const { engine } = this;
		const { pageX, pageY, buttons } = e;
		const { canvas } = engine;
		const rect = canvas.getBoundingClientRect();
		const x = (pageX - rect.x) / rect.width * canvas.offsetWidth,
			  y = (pageY - rect.y) / rect.height * canvas.offsetHeight;
		if (x < 0 || y < 0 || x > canvas.offsetWidth || y > canvas.offsetHeight) {
			return;
		}

		let hovering = null;
		for (let i = engine.spriteCollection.size() - 1; i >= 0; i--) {
			const sprite = engine.spriteCollection.get(i);
			if (sprite.disabled) {
				continue;
			}
			const collisionBox = sprite.getCollisionBox(this.engine.lastTime);
			if (collisionBox && engine.pointContains(x, y, collisionBox)) {
				hovering = sprite;
				break;
			}
		}
		if (hovering && !hovering.disabled) {
			if (e.type === "mousedown" && hovering.onMouseDown) {
				this.audio.beep.play();
				hovering.onMouseDown();
			} 
			if (e.type === "click" && hovering.onClick) {
				hovering.onClick();
			}
		}
		this.customize.changeOpacity(hovering===this.customize?1:0, this.engine.lastTime);
		this.load.changeOpacity(hovering===this.load?1:0, this.engine.lastTime);
		this.start.changeOpacity(hovering===this.start?1:0, this.engine.lastTime);

		const cursor = !this.selectedItem && hovering ? "pointer" : "";
		if (this.cursor !== cursor) {
			this.cursor = cursor;
			overlay.style.cursor = cursor;
		}
	}

	async postInit() {
		await super.postInit();
		const audio = document.getElementById("audio");
		audio.currentTime = 0;
		this.setAudio(audio, true, .5);
	}

	onExit(engine) {
		const audio = document.getElementById("audio");
		this.setAudio(audio, false, .5);
		engine.keyboardHandler.clearListeners();		
	}
}