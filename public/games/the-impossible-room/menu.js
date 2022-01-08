class Menu extends GameBase {
	async init(engine, gameName) {
		await super.init(engine, gameName);

		const { config } = engine;

		/* Load Audio */
		this.audio = {
			...this.audio,
		};

		this.mainTheme = await engine.music.getAudio("music/weirdsong.mp3");

		this.atlas = {
			...this.atlas,
			menu: await engine.addTexture({
				url: "assets/menu.png",
				// texture_url: "assets/skin-texture.jpg",
				// texture_blend: "luminosity",
				// texture_alpha: .3,
			}),
			aboutPage: await engine.addTexture({
				url: "assets/about.png",
				collision_url: "assets/about.png",
			}),
			aboutPage2: await engine.addTexture({
				url: "assets/about-2.png",
				collision_url: "assets/about-2.png",
			}),
			aboutPage3: await engine.addTexture({
				url: "assets/about-3.png",
				collision_url: "assets/about-3.png",
			}),
			optionsPage: await engine.addTexture({
				url: "assets/options.png",
				collision_url: "assets/options.png",
				texture_url: "assets/backwall.jpg",
				texture_blend: "luminosity",
				texture_alpha: .3,
				cols: 1, rows: 3,
				range: [0],
			}),
			option1: await engine.addTexture({
				url: "assets/options.png",
				cols: 1, rows: 3,
				range: [1],
			}),
			option2: await engine.addTexture({
				url: "assets/options.png",
				cols: 1, rows: 3,
				range: [2],
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
			about: await engine.addTexture({
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
			check: await engine.addTexture({
				url: "assets/invitation-check.png",
				collision_url: "assets/invitation-check-collision.png",
				texture_url: "assets/skin-texture.jpg",
				texture_blend: "source-atop",
				texture_alpha: .9,
				cols:1,rows:3,
				range:[0],
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
				const audio = this.mainTheme;
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
		this.about = this.spriteFactory.create({
			anim: this.atlas.about,
			opacity: 0,
			size: [800, 400],
		}, {
			onClick: () => {
				this.aboutPage.changeOpacity(1, this.engine.lastTime);
				this.aboutPage2.changeOpacity(1, this.engine.lastTime);
				this.aboutPage3.changeOpacity(1, this.engine.lastTime);
				const audio = this.mainTheme;
				if (!audio.paused) {
					this.setAudio(audio, true, .15);					
				}
				this.aboutPage.disabled = false;
				this.aboutPage2.disabled = false;
				this.aboutPage3.disabled = false;
			},
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
		this.options = this.spriteFactory.create({
			anim: this.atlas.start,
			opacity: 0,
			size: [800, 400],
			x: -110,
			y: -130,
		}, { 
			onClick: () => {
				this.optionsPage.changeOpacity(1, this.engine.lastTime);
				this.option1.changeOpacity(1, this.engine.lastTime);
				this.option2.changeOpacity(1, this.engine.lastTime);
				const audio = this.mainTheme;
				if (!audio.paused) {
					this.setAudio(audio, true, .15);					
				}
				this.optionsPage.disabled = false;
				this.option1_check.setProperty("disabled", false);
				this.option2_check.setProperty("disabled", false);
			},
		});
		this.aboutPage3 = this.spriteFactory.create({
			anim: this.atlas.aboutPage3,
			opacity: 0,
			size: [800, 400],
		}, {
			disabled: true,
			cursor: "url(assets/next-cursor.png), auto",
			onClick: page => {
				page.changeOpacity(0, this.engine.lastTime);
				const audio = this.mainTheme;
				if (!audio.paused) {
					this.setAudio(audio, true, .5);					
				}
				page.disabled = true;
				getMedal("About Me", this.onUnlockMedal);
			},
		});			
		this.aboutPage2 = this.spriteFactory.create({
			anim: this.atlas.aboutPage2,
			opacity: 0,
			size: [800, 400],
		}, {
			disabled: true,
			cursor: "url(assets/next-cursor.png), auto",
			onClick: page => {
				page.changeOpacity(0, this.engine.lastTime);
				page.disabled = true;
			},
		});		
		this.aboutPage = this.spriteFactory.create({
			anim: this.atlas.aboutPage,
			opacity: 0,
			size: [800, 400],
		}, {
			disabled: true,
			cursor: "url(assets/next-cursor.png), auto",
			onClick: page => {
				page.changeOpacity(0, this.engine.lastTime);
				page.disabled = true;
			},
		});

		this.optionsPage = this.spriteFactory.create({
			anim: this.atlas.optionsPage,
			opacity: 0,
			size: [800, 400],
		}, {
			disabled: true,
			cursor: "url(assets/next-cursor.png), auto",
			onClick: page => {
				page.changeOpacity(0, this.engine.lastTime);
				page.disabled = true;
				this.option1.changeOpacity(0, this.engine.lastTime);
				this.option2.changeOpacity(0, this.engine.lastTime);
				this.option1_check.setProperty("disabled", true);
				this.option2_check.setProperty("disabled", true);

				const audio = this.mainTheme;
				if (!audio.paused) {
					this.setAudio(audio, true, .5);					
				}

				const messages = [];
				if (localStorage.getItem("extra_hints")) {
					messages.push("The host will provide extra hints when asked.");
				}
				if (localStorage.getItem("alternate_voices")) {
					messages.push("You can change the main player's default voice.");
				}
				if (messages.length) {
					showNotice(messages.join("\n"), messages.length);
				}
			},
		});
		this.option1 = this.spriteFactory.create({
			anim: this.atlas.option1,
			opacity: 0,
			size: [400, 200],
		});
		this.option2 = this.spriteFactory.create({
			anim: this.atlas.option2,
			opacity: 0,
			y: 40,
			size: [400, 200],
		});
		this.option1_check = this.spriteFactory.create({
			anim: this.atlas.check,
			x: -65, y: -115,
			size: [275, 200],
			opacity: 0,
		}, {
			disabled: true,
			cursor: "url(assets/pointer-cursor.png), auto",
			onClick: check => {
				check.setProperty("checked", !check.properties.checked);
			},
			onChange: {
				disabled: (check, disabled) => {
					check.changeOpacity(check.properties.checked && !check.properties.disabled ? 1 : 0.01, this.engine.lastTime);
					check.disabled = disabled;
				},
				checked: (check, checked) => {
					check.changeOpacity(check.properties.checked && !check.properties.disabled ? 1 : 0.01, this.engine.lastTime);
					if (checked) {
						localStorage.setItem("extra_hints", true);
					} else {
						localStorage.removeItem("extra_hints");
					}
				},
			},	
		});
		this.option1_check.setProperty("disabled", true);
		this.option1_check.setProperty("checked", localStorage.getItem("extra_hints") || false);
		this.option2_check = this.spriteFactory.create({
			anim: this.atlas.check,
			size: [275, 200],
			x: -65, y: -115 + 40,
			opacity: 0,
		}, {
			disabled: true,
			cursor: "url(assets/pointer-cursor.png), auto",
			onClick: check => {
				check.setProperty("checked", !check.properties.checked);
			},
			onChange: {
				disabled: (check, disabled) => {
					check.changeOpacity(check.properties.checked && !check.properties.disabled ? 1 : 0.01, this.engine.lastTime);
					check.disabled = disabled;
				},
				checked: (check, checked) => {
					check.changeOpacity(check.properties.checked && !check.properties.disabled ? 1 : 0.01, this.engine.lastTime);
					if (checked) {
						localStorage.setItem("alternate_voices", true);
					} else {
						localStorage.removeItem("alternate_voices");
					}
					document.getElementById("voice-selector").style.display = checked ? "": "none";
				},
			},	
		});
		this.option2_check.setProperty("disabled", true);
		this.option2_check.setProperty("checked", localStorage.getItem("alternate_voices") || false);

		engine.postScore(0);
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
			const cursor = "url(assets/mouse-cursor.png), auto";
			if (this.cursor !== cursor) {
				this.cursor = cursor;
				overlay.style.cursor = cursor;
			}
			return;
		}

		let hovering = null;
		for (let i = engine.spriteCollection.size() - 1; i >= 0; i--) {
			const sprite = engine.spriteCollection.get(i);
			if (sprite.disabled) {
				continue;
			}
			const collisionBox = sprite.getCollisionBox(this.engine.lastTime);
			if (collisionBox && collisionBox.containsPoint(x, y)) {
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
				hovering.onClick(hovering);
			}
		}
		this.customize.changeOpacity(hovering===this.customize?1:0, this.engine.lastTime);
		this.about.changeOpacity(hovering===this.about?1:0, this.engine.lastTime);
		this.start.changeOpacity(hovering===this.start?1:0, this.engine.lastTime);
		this.options.changeOpacity(hovering===this.options?1:0, this.engine.lastTime);

		const cursor = !this.selectedItem && hovering ? ((hovering.opacity <= 0 ? null : hovering.cursor) || this.getMouseCursor()) : "";
		if (this.cursor !== cursor) {
			this.cursor = cursor;
			overlay.style.cursor = cursor;
		}
	}

	async postInit() {
		await super.postInit();
		const audio = this.mainTheme;
		audio.currentTime = 0;
		this.setAudio(audio, true, .5);
	}

	async onExit(engine) {
		const audio = this.mainTheme;
		this.setAudio(audio, false, .5);
		engine.keyboardHandler.clearListeners();		
		if (document.getElementById("newgrounds-login")) {
			document.getElementById("newgrounds-login").style.display = "none";
		}
		return super.onExit(engine);
	}
}