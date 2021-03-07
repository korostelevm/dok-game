class GameCore {
	constructor(imageLoader) {
		this.imageLoader = imageLoader;
	}

	async init(engine) {
		const { gl, config } = engine;
		this.engine = engine;

		//	Monkor
		this.atlas = {
			monkor_still: await engine.addTexture(
				{
					url: "assets/monkor.png",
					collision_url: "assets/monkor-collision.png",
					cols:5,rows:5,
					range:[0],
				}),
			monkor_front: await engine.addTexture(
				{
					url: "assets/monkor.png",
					cols:5,rows:5,
					frameRate:10,
					range:[1, 4],
				}),
			monkor_back: await engine.addTexture(
				{
					url: "assets/monkor.png",
					cols:5,rows:5,
					frameRate:10,
					range:[5, 8],
				}),
			monkor_right: await engine.addTexture(
				{
					url: "assets/monkor.png",
					cols:5,rows:5,
					frameRate:10,
					range:[9, 12],
				}),
			monkor_talk: await engine.addTexture(
				{
					url: "assets/monkor.png",
					cols:5,rows:5,
					frameRate:10,
					range:[13, 16],
				}),
			monkor_smoke: await engine.addTexture(
				{
					url: "assets/monkor.png",
					cols:5,rows:5,
					frameRate:8,
					range:[17, 19],
				}),
			monkor_puff: await engine.addTexture(
				{
					url: "assets/monkor.png",
					cols:5,rows:5,
					range:[20],
				}),
			monkor_scared: await engine.addTexture(
				{
					url: "assets/monkor.png",
					cols:5,rows:5,
					range:[21],
				}),
			monkor_run: await engine.addTexture(
				{
					url: "assets/monkor.png",
					cols:5,rows:5,
					frameRate:10,
					range:[21, 24],
				}),
			piano: await engine.addTexture(
				{
					url: "assets/piano.png",
					cols:1,rows:2,
					range:[0],
				}),
			piano_splash: await engine.addTexture(
				{
					url: "assets/piano.png",
					cols:1,rows:2,
					range:[1],
				}),
			mouse: await engine.addTexture(
				{
					url: "assets/mouse.png",
					cols:2,rows:2,
					range:[0],
				}),
			mouse_run: await engine.addTexture(
				{
					url: "assets/mouse.png",
					cols:2,rows:2,
					frameRate: 20,
					range:[1, 2],
				}),
		};


		//	inventory		
		this.inventory = [];
		this.inventoryIcons = {};
		this.inventoryDetails = {};

		this.defaultCommand = (item, target) => `use ${item.name} on ${target.name}`;

		this.addListeners(engine);

		this.inventoryIcons = {
			...this.inventoryIcons,
			key: "🗝",
			cigarette: "🚬",
			note: "📜",
		}		
	}

	addMonkor() {
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
	}

	postInit() {
	}

	clear(engine) {
		this.removeListeners(engine);
	}

	addListeners(engine) {
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
	}


	removeListeners(engine) {
		engine.keyboardHandler.clearListeners();
	}

	onDropOnOverlay(e) {
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
		this.paused = true;
		document.getElementById("restart").style.display = "block";
		document.getElementById("game-over").style.display = "block";
		let f;
		document.getElementById("restart").addEventListener("click", f = e => {
			document.getElementById("restart").removeEventListener("click", f);
			document.getElementById("restart").style.display = "none";
			document.getElementById("game-over").style.display = "none";
			document.getElementById("game-over-message").style.display = "none";
			this.engine.setGame(new this.constructor(this.imageLoader));
		});
	}

	active() {
		if (this.paused) {
			return false;
		}
		if (!this.monkor || this.monkor.paused || this.monkor.dead || this.mouse.alive || this.monkor.anim === this.atlas.monkor_talk) {
			return false;
		}
		return true;
	}

	handleMouse(e) {
		if (e.target.id === "im" || e.target.id === "title") {
			this.onMouseTitle(e);	
			return;		
		}
		if (!this.active()) {
			return;
		}
		if (e.type === "click") {
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
		for (let i = engine.spriteCollection.size() - 1; i >= 0; i--) {
			const sprite = engine.spriteCollection.get(i);
			if (sprite.actions) {
				const collisionBox = sprite.getCollisionBox(lastTime);
				if (collisionBox && engine.pointContains(x, y, collisionBox)) {
					hovering = sprite;
					break;
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
			if (this.selectedItem && hovering) {
				const itemDetails = this.inventoryDetails[this.selectedItem];
				this.monkor.pendingAction = this.getActionWithItem(hovering, itemDetails);
				this.showActions(itemDetails, hovering);
			} else {
				this.monkor.pendingAction = null;
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
		this.showSubject(this.monkor.target || hovering);
		overlay.style.cursor = hovering ? "pointer" : "";

		if (this.selectedItem && e.type === "mousedown") {
			this.updateInventory(null);
		}

		if (this.lastHovering !== hovering) {
			this.lastHovering = hovering;
			this.checkItem(hovering);
		}
	}

	showSubject(subject) {
		if (!this.subjectNameDiv) {
			this.subjectNameDiv = document.getElementById("subject-name");
		}
		this.subjectNameDiv.innerText = subject ? subject.name : "";		
	}

	checkItem(hovering) {
		if (this.selectedItem) {
			const itemDetails = this.inventoryDetails[this.selectedItem];
			this.showActions(itemDetails, hovering);
		}
	}

	onClickWithItem(target, item) {
		console.log(item, target);
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
				this.showSubject(this.monkor.target);
				this.subjectDiv.classList.add("selected");
			} else {
				this.subjectDiv.classList.remove("selected");
			}
		}
	}

	showActions(target, hovering) {
		if (this.showingTarget !== target || this.showingHovering !== hovering) {
			const subjecActions = document.getElementById("subject-actions");
			this.showingTarget = target;
			this.showingHovering = hovering;
			subjecActions.style.display = this.showingTarget && this.showingTarget.actions ? "" : "none";
			if (this.showingTarget) {
				subjecActions.innerText = "";
				if (this.monkor.pendingAction && hovering) {
					const command = this.monkor.pendingAction.command || hovering.defaultCommand || target.defaultCommand || this.defaultCommand;
					this.addAction(this.monkor.target, this.monkor.pendingAction, true, command(target, hovering));
				} else {
					this.showingTarget.actions.forEach(action => this.addAction(target, action));

					if (hovering) {
						this.checkActionsWithItem(hovering, target);
					}
				}
			}
		}
	}

	itemActionOnTarget(item, target) {
		return {
			item: item.name,
			message: `I cannot use the ${item.name} on the ${target.name}.`,
		};
	}

	getActionWithItem(target, item) {
		if (target === item) {
			return null;
		}
		return target.actions.filter(action => {
			if (action.condition && !action.condition(target)) {
				return false;
			}
			return action.item === item.name;
		})[0] || this.itemActionOnTarget(item, target);
	}

	checkActionsWithItem(target, item) {
		const action = this.getActionWithItem(target, item);
		if (!action) {
			return;
		}
		const command = action.command || target.defaultCommand || item.defaultCommand || this.defaultCommand;
		this.addAction(item, action, true, command(item, target));
	}

	addAction(target, action, highlight, messageOverride) {
		if (action.condition && !action.condition(target)) {
			return false;
		}
		const subjecActions = document.getElementById("subject-actions");
		const div = subjecActions.appendChild(document.createElement("div"));
		div.classList.add("action");
		if (highlight) {
			div.classList.add("selected");
		}
		div.innerText = messageOverride || action.name;
		div.addEventListener("click", e => {
			this.performAction(action, target);
		});
	}

	performAction({name, condition, message, action}, target) {
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
		this.monkor.pendingAction = null;
		this.selectTarget(null);
		this.updateInventory();
		this.showActions(null);
		this.showSubject(null);
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

	updateSpeech(time, dt) {
		if (this.finishedSpeech()) {
			return;
		}

		const { speech, speechStarted, lastCharacter } = this.monkor;
		if (speech && speechStarted && (this.monkor.speechPause <= 0 || this.monkor.noVoice)) {
			const textSpeed = (this.monkor.noVoice ? 50 : 20);
			if (!lastCharacter || (time - lastCharacter) * Math.min(2, dt / 16) >= textSpeed) {
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

	applyMovement(monkor, mouse, dt, time) {
		const { engine } = this;
		const { lastTime } = engine;
		if (mouse.alive) {
			if (time - mouse.alive < 3000) {
				const dx = mouse.x - monkor.x;
				monkor.changeDirection(dx < 0 ? -1 : 1, time);
				monkor.changeAnimation(this.atlas.monkor_scared, time);
				if (!monkor.scared) {
					monkor.scared = time;
					engine.playAudio("audio/scream.mp3", 1);
					this.setAudio(audio, audio.paused, 0);
				}
			} else {
				const dx = -(mouse.x - monkor.x);
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


		if (monkor.goingup) {
			const elapsed = Math.max(0, time - monkor.goingup - 500);
			if (elapsed > 0) {
				monkor.changeAnimation(this.atlas.monkor_back, time);
				monkor.changePosition(400, 350 - 30 * (elapsed / 2000), time);
				monkor.changeOpacity(Math.max(0, 1 - (elapsed / 2000)), time);
				if (elapsed > 4000 && !monkor.levelup) {
					this.monkor.levelup = lastTime;
					document.getElementById("game-over-message").style.display = "block";
					document.getElementById("game-over-message").innerText = "Ok I lied. This room is possible to get into. But you can't get out, because I didn't finish making this game. Sorry! Come back later!";
					this.gameOver();
				}
			}
			return;
		}



		const speed = 2 * monkor.speed * Math.min(2, dt / 16);
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

	dropPiano(time) {
		this.piano.dropping = time;
		this.piano.changeOpacity(1, time);
		this.piano.dy = 30;
		this.piano.changePosition(this.monkor.x, this.monkor.y - 1000, time);
	}

	updatePiano(time, dt) {
		if (!this.piano.dropping) {
			return;
		}
		if (this.piano.y < this.monkor.y + 20) {
			this.piano.changePosition(this.piano.x, this.piano.y + this.piano.dy * Math.min(2, dt / 16), time);
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

	setAudio(audio, value, volume, ignore) {
		if (value) {
			document.getElementById("speaker").innerText = "🔊";
			document.getElementById("mute").innerText = "mute";
			audio.play();
			if (!this.monkor.dead && !this.monkor.scared && !ignore) {
				this.showBubble("I like this music.");
			}
		} else {
			audio.pause();
			document.getElementById("speaker").innerText = "🔇";
			document.getElementById("mute").innerText = "unmute";
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
			if (this.monkor.pendingAction) {
				this.performAction(this.monkor.pendingAction, this.monkor.target);
			} else {
				this.showActions(this.monkor.target);
			}
		}
	}

	addToInventory(item) {
		this.inventory.push(item);
		this.updateInventory();
	}

	removeFromInventory(item) {
		this.inventory.remove(item);
		this.updateInventory();
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
			k.innerText = this.inventoryIcons[item] + " " + item;
			const itemDetails = this.inventoryDetails[item];
			k.addEventListener("mouseover", e => {
				this.checkItem(itemDetails);
			});
			k.addEventListener("mouseout", e => {
				this.checkItem(null);
			});
			k.addEventListener("click", e => {
				if (!this.active()) {
					return;
				}
				if (!this.selectedItem) {
					this.updateInventory(item);
				}  else if (this.selectedItem !== item) {
					const action = this.getActionWithItem(itemDetails, this.inventoryDetails[this.selectedItem]);
					this.performAction(action, itemDetails);
				} else {
					this.updateInventory(null);
					this.selectTarget(null);
					this.showActions(null);
					this.showSubject(null);
				}
			});
			if (selection === item) {
				this.selectedItem = item;
				k.classList.add("selected");
				const itemDetails = this.inventoryDetails[item];
				this.selectTarget(itemDetails);
				this.showActions(itemDetails);
			} else if (selection) {
				k.classList.add("deemphasized");
			}
		});
	}

	refresh(time, dt) {
		this.applyMovement(this.monkor, this.mouse, dt, time);
		this.checkCollisions(time);
		this.updateSpeech(time, dt);
		this.updatePiano(time, dt);
		this.updateMouse(time);		
	}
}