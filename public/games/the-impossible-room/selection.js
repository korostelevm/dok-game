class Selection extends GameBase {
	async init(engine, gameName) {
		await super.init(engine, gameName);

		const { gl, config } = engine;
		const { gender } = this.data;

		/* Load Audio */
		this.audio = {
			...this.audio,
			beep: engine.soundManager.getSound("audio/beep.mp3", .5,),
		};

		/* Load image */
		this.atlas = {
			...this.atlas,
			backwall: await engine.addTexture({
				url: "assets/backwall.jpg",
			}),
			card: await engine.addTexture({
				url: "assets/invitation.png",
				texture_url: "assets/backwall.jpg",
				texture_alpha: .25,
			}),
			check_he: await engine.addTexture({
				url: "assets/invitation-check.png",
				collision_url: "assets/invitation-check-collision.png",
				cols:1,rows:3,
				range:[0],
			}),
			check_she: await engine.addTexture({
				url: "assets/invitation-check.png",
				collision_url: "assets/invitation-check-collision.png",
				cols:1,rows:3,
				range:[1],
			}),
			check_they: await engine.addTexture({
				url: "assets/invitation-check.png",
				collision_url: "assets/invitation-check-collision.png",
				cols:1,rows:3,
				range:[2],
			}),
			next_button: await engine.addTexture({
				url: "assets/next-button.png",
				collision_url: "assets/next-button.png",
				cols: 1, rows: 2,
				range: [0],
			}),
			next_button_down: await engine.addTexture({
				url: "assets/next-button.png",
				collision_url: "assets/next-button.png",
				cols: 1, rows: 2,
				range: [1],
			}),
		};

		const [viewportWidth, viewportHeight] = config.viewport.size;

		this.backwall = this.spriteFactory.create({
			anim: this.atlas.backwall,
			size: [viewportWidth, viewportHeight],
			opacity: .5,
		});
		this.card = this.spriteFactory.create({
			name: "card",
			x: 400 - this.atlas.card.spriteWidth / 2 / 2,
			anim: this.atlas.card,
			size: [550, 400],
		});
		this.check_he = this.spriteFactory.create({
			name: "check_he",
			x: 400 - this.atlas.card.spriteWidth / 2 / 2,
			anim: this.atlas.check_he,
			size: [550, 400],
		}, {
			onMouseDown: () => this.setProperty("check", "he"),
		});
		this.check_she = this.spriteFactory.create({
			name: "check_she",
			x: 400 - this.atlas.card.spriteWidth / 2 / 2,
			anim: this.atlas.check_she,
			size: [550, 400],
		}, {
			onMouseDown: () => this.setProperty("check", "she"),
		});
		this.check_they = this.spriteFactory.create({
			name: "check_they",
			x: 400 - this.atlas.card.spriteWidth / 2 / 2,
			anim: this.atlas.check_they,
			size: [550, 400],
		}, {
			onMouseDown: () => this.setProperty("check", "they"),
		});
		this.next_button = this.spriteFactory.create({
			name: "next_button",
			x: 680, y: 280,
			anim: this.atlas.next_button,
			size: [100, 100],
			opacity: .2,
		}, {
			disabled: true,
			onMouseDown: () => this.next_button.changeAnimation(this.atlas.next_button_down, engine.lastTime),
			onClick: () => {
				this.startGame();
			},
		});

		this.overContainer = document.getElementById("over-container");
		const input = this.overContainer.appendChild(document.createElement("input"));
		input.style.position = "relative";
		input.style.fontSize = "45pt";
		input.style.left = "250px";
		input.style.top = "215px";
		input.style.outline = "none";
		input.style.borderStyle = "hidden";
		input.setAttribute("spellcheck", false);
		input.style.color = "#3634d6";
		input.value = this.data.name || (this.engine.inception ? null : localStorage.getItem("playerName")) || "Monkor Bakaru";
		input.size = 55;
		input.style.background = "none";
		input.style.fontFamily = "handwriting";
		this.playerNameInput = input;

		this.applyGender(gender);
	}

	startGame() {
		const classObj = this.engine.lastGame ? nameToClass(this.engine.lastGame) : Menu;
		this.engine.setGame(new classObj());
	}

	onChange(key, value) {
		if (key==="check") {
			const { engine } = this;
			const he = value === "he";
			const she = value === "she";
			const they = value === "they";
			this.check_he.changeOpacity(he ? 1 : 0, engine.lastTime);
			this.check_she.changeOpacity(she ? 1 : 0, engine.lastTime);
			this.check_they.changeOpacity(they ? 1 : 0, engine.lastTime);
			this.next_button.disabled = !(he || she || they);
			this.next_button.changeOpacity(this.next_button.disabled ? .2 : 1, engine.lastTime);
		}
	}

	applyGender(gender) {
		switch(gender) {
			case "M":
				this.setProperty("check", "he");
				break;
			case "W":
				this.setProperty("check", "she");
				break;
			case "T":
				this.setProperty("check", "they");
				break;
			default:
				this.setProperty("check", "none");
				break;
		}
	}

	async onExit(engine) {
		const previousGender = this.data.gender;
		let character = "monkor";
		switch(this.properties.check) {
			case "he":
				this.data.gender = "M";
				character = "monkor";
				break;
			case "she":
				this.data.gender = "W";
				character = "nuna";
				break;
			case "they":
				this.data.gender = "T";
				character = "twin";
				break;
			default:
				this.data.gender = "M";
				character = "monkor";
				break;					
		}
		if (this.data.gender !== previousGender && this.engine.lastGame !== "Menu") {
			getMedal("Gender Fluid", this.onUnlockMedal);
		}
		this.data.name = this.playerNameInput.value;
		this.overContainer.innerText = "";

		if (!this.engine.inception) {
			engine.playerOverlay.changeCharacter(character);
			localStorage.setItem("playerName", this.data.name);
			localStorage.setItem("playerGender", this.data.gender);
			document.getElementById("player-name").textContent =
				this.data.name.toUpperCase().startsWith("MONKOR") ? "Monkor" : this.data.name;
		}
		return super.onExit(engine);
	}

	handleMouse(self, e, x, y) {
		const { engine } = this;
		const { buttons } = e;
		const { canvas } = engine;
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
				hovering.onClick();
			}
		}

		const cursor = !this.selectedItem && hovering ? this.getMouseCursor() : "";
		if (this.cursor !== cursor) {
			this.cursor = cursor;
			overlay.style.cursor = cursor;
		}
	}

	getDefaultWindowSize(viewportWidth, viewportHeight) {
		return [viewportWidth + 200, viewportHeight + 200];
	}

	getMargin() {
		return { top: 50 };
	}
}