class RoomBase extends GameBase {
	async init(engine, coreName) {
		await super.init(engine, coreName);
		if (!this.data.gender) {
			this.data.gender = (this.core.playerOverlay.inception ? null : localStorage.getItem("playerGender")) || "M";
		}

		this.core.sidebar.updateSidebar(this.sceneTag, localStorage.getItem("joker"));
		this.core.sidebar.enableSidebar(false);

		this.dragDrop = new DragDrop(this);
		await this.dragDrop.init();

		const { gl, config } = this.engine;

		const { gender } = this.data;
		const genderToUrl = {
			M: "assets/monkor.png",
			W: "assets/nuna.png",
			T: "assets/twin.png",
		};
		const genderToShakeUrl = {
			M: "assets/monkor-shake.png",
			W: "assets/nuna-shake.png",
			T: "assets/twin-shake.png",			
		};

		const url = genderToUrl[gender];
		const spritesheet = {
			url,
			cols: gender === 'T' ? 6 : 5,
			rows: gender === 'T' ? 6 : 5,
		};
		if (!url) {
			console.error(`ERROR: gender ${gender}.`);
		}

		//	Audio
		this.audio = {
			... this.audio,
			scream: engine.soundManager.getSound("audio/scream.mp3", 1),
			piano: engine.soundManager.getSound("audio/piano.mp3", 1),
			beep: engine.soundManager.getSound("audio/beep.mp3", .5,),
			eat: engine.soundManager.getSound("audio/eat.mp3", .5),
			dud: engine.soundManager.getSound("audio/dud.mp3", 1),
			hit: engine.soundManager.getSound("audio/hit.mp3", .5),
			door: engine.soundManager.getSound("audio/door.mp3", .5),
			pickup: engine.soundManager.getSound("audio/pickup.mp3", .3),
			drink: engine.soundManager.getSound("audio/drink.mp3", 1),
			mouse: engine.soundManager.getSound("audio/animal-cry.mp3", 1),
			jingle: engine.soundManager.getSound("audio/jingle.mp3", 1),
		};


		//	Monkor
		this.atlas = {
			...this.atlas,
			monkor_still: await engine.addTexture(
				{
					...spritesheet,
					collision_url: "assets/monkor-collision.png",
					range:[0],
					hotspot: [.5, 1],
				}),
			monkor_back_still: await engine.addTexture(
				{
					...spritesheet,
					collision_url: "assets/monkor-collision.png",
					range:[6],
					hotspot: [.5, 1],
				}),
			monkor_front: await engine.addTexture(
				{
					...spritesheet,
					frameRate:10,
					range:[1, 4],
					hotspot: [.5, 1],
				}),
			monkor_back: await engine.addTexture(
				{
					...spritesheet,
					frameRate:10,
					range:[5, 8],
					hotspot: [.5, 1],
				}),
			monkor_left: await engine.addTexture(
				{
					...spritesheet,
					frameRate:10,
					range: gender === 'T' ? [13, 16] : [9, 12],
					direction: gender === 'T' ? 1 : -1,
					hotspot: [.5, 1],
				}),
			monkor_right: await engine.addTexture(
				{
					...spritesheet,
					frameRate:10,
					range: gender === 'T' ? [9, 12] : [9, 12],
					hotspot: [.5, 1],
				}),
			monkor_stand_left: await engine.addTexture(
				{
					...spritesheet,
					frameRate:10,
					range: gender === 'T' ? [14] : [10],
					direction: gender === 'T' ? 1 : -1,
					hotspot: [.5, 1],
				}),
			monkor_stand_right: await engine.addTexture(
				{
					...spritesheet,
					frameRate:10,
					range: gender === 'T' ? [14] : [10],
					hotspot: [.5, 1],
				}),
			monkor_chew: await engine.addTexture(
				{
					...spritesheet,
					frameRate:10,
					range: gender==="T" ? [17, 18] : [13, 14],
					hotspot: [.5, 1],
				}),
			monkor_talk: await engine.addTexture(
				{
					...spritesheet,
					frameRate:10,
					range: gender==="T" ? [17, 20] : [13, 16],
					hotspot: [.5, 1],
				}),
			monkor_talk_2: await engine.addTexture(
				{
					...spritesheet,
					frameRate:10,
					range: gender==="T" ? [21, 25] : [13, 16],
					hotspot: [.5, 1],
				}),
			monkor_smoke: await engine.addTexture(
				{
					...spritesheet,
					frameRate:8,
					range: gender === "T" ? [26, 28] : [17, 19],
					hotspot: [.5, 1],
				}),
			monkor_puff: await engine.addTexture(
				{
					...spritesheet,
					range: gender === "T" ? [29] : [20],
					hotspot: [.5, 1],
				}),
			monkor_blow: await engine.addTexture(
				{
					...spritesheet,
					frameRate: gender==="T" ? 3 : 8,
					range: gender === "T" ? [30, 32] : [17, 19],
					hotspot: [.5, 1],
				}),
			monkor_scared_right: await engine.addTexture(
				{
					...spritesheet,
					range: gender === "T" ? [33] : [21],
					hotspot: [.5, 1],
				}),
			monkor_scared_left: await engine.addTexture(
				{
					...spritesheet,
					range: gender === "T" ? [34] : [21],
					direction: -1,
					hotspot: [.5, 1],
				}),
			monkor_run_right: await engine.addTexture(
				{
					...spritesheet,
					frameRate:10,
					range: gender==="M" ? [21, 24]
						: gender==="W" ? [9, 12]
						: gender === "T" ? [9, 12]
						: [0],
					hotspot: [.5, 1],
				}),
			monkor_run_left: await engine.addTexture(
				{
					...spritesheet,
					frameRate:10,
					range: gender==="M" ? [21, 24]
						: gender==="W" ? [9, 12]
						: gender==="T" ? [13, 16]
						: [0],
					direction: -1,
					hotspot: [.5, 1],
				}),
			piano: await engine.addTexture(
				{
					url: "assets/piano.png",
					cols:1,rows:2,
					range:[0],
					hotspot: [.5, 1],
				}),
			piano_splash: await engine.addTexture(
				{
					url: "assets/piano.png",
					cols:1,rows:2,
					range:[1],
					hotspot: [.5, 1],
				}),
			mouse: await engine.addTexture(
				{
					url: "assets/mouse.png",
					cols:3,rows:3,
					range:[0],
					hotspot: [.5, .5],
				}),
			mouse_run: await engine.addTexture(
				{
					url: "assets/mouse.png",
					cols:3,rows:3,
					frameRate: 20,
					range:[1, 2],
				}),
			mouse_eat: await engine.addTexture(
				{
					url: "assets/mouse.png",
					cols:3,rows:3,
					frameRate: 20,
					range:[3, 5],
				}),
			file: await engine.addTexture(
				{
					url: "assets/mouse.png",
					collision_url: "assets/mouse.png",
					cols:3,rows:3,
					range:[6],
					hotspot: [.5, 1],
				}),
			monkor_shake_left: await engine.addTexture({
					url: genderToShakeUrl[gender],
					collision_url: genderToShakeUrl[gender],
					cols: 1, rows: 2,
					direction: -1,
					range: [0,1],
					frameRate: 5,
					hotspot: [.5, 1],
				}),
			monkor_shake_right: await engine.addTexture({
					url: genderToShakeUrl[gender],
					collision_url: genderToShakeUrl[gender],
					cols: 1, rows: 2,
					range: [0,1],
					frameRate: 5,
					hotspot: [.5, 1],
				}),
			monkor_knock_left: await engine.addTexture({
					url: genderToShakeUrl[gender],
					collision_url: genderToShakeUrl[gender],
					cols: 1, rows: 2,
					direction: -1,
					range: [0],
					frameRate: 5,
					hotspot: [.5, 1],
				}),
			monkor_knock_right: await engine.addTexture({
					url: genderToShakeUrl[gender],
					collision_url: genderToShakeUrl[gender],
					cols: 1, rows: 2,
					range: [0],
					frameRate: 5,
					hotspot: [.5, 1],
				}),
			backwall: await engine.addTexture(
				{
					url: "assets/lobby.png",
					collision_url: "assets/lobby-collision.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .15,
					texture_blend: "source-atop",
					cols:4,rows:7,
					range:[0],
				}),
			backwallforeground: await engine.addTexture(
				{
					url: "assets/lobby.png",
					collision_url: "assets/lobby-collision.png",
					texture_url: "assets/backwall.jpg",
					texture_alpha: .15,
					texture_blend: "source-atop",
					cols:4,rows:7,
					range:[23],
				}),			
			side_doors: await engine.addTexture(
				{
					url: "assets/lobby.png",
					collision_url: "assets/lobby-collision.png",
					cols:4,rows:7,
					range:[1],
				}),	
			left_door: await engine.addTexture(
				{
					url: "assets/lobby.png",
					collision_url: "assets/lobby-collision.png",
					cols:4,rows:7,
					range:[14],
				}),
			left_door_opened: await engine.addTexture(
				{
					url: "assets/lobby.png",
					collision_url: "assets/lobby-collision.png",
					cols:4,rows:7,
					range:[15],
				}),
			right_door: await engine.addTexture(
				{
					url: "assets/lobby.png",
					collision_url: "assets/lobby-collision.png",
					cols:4,rows:7,
					range:[12],
				}),
			right_door_opened: await engine.addTexture(
				{
					url: "assets/lobby.png",
					collision_url: "assets/lobby-collision.png",
					cols:4,rows:7,
					range:[13],
				}),
			butler: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [0],
					hotspot: [.25, 1],
				}),
			butler_still_right: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [17],
					frameRate: 5,
					hotspot: [.25, 1],
				}),
			butler_walk_right: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [5, 8],
					frameRate: 5,
					hotspot: [.25, 1],
				}),
			butler_talk_right: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [17,20],
					frameRate: 5,
					hotspot: [.25, 1],
				}),
			butler_shake_hands_right: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [21,22],
					frameRate: 5,
					hotspot: [.25, 1],
				}),
			butler_shake_hands_talk_right: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [22,25],
					frameRate: 5,
					hotspot: [.25, 1],
				}),
			butler_still_left: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [17],
					direction: -1,
					frameRate: 5,
					hotspot: [.25, 1],
				}),
			butler_walk_left: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [5, 8],
					direction: -1,
					frameRate: 5,
					hotspot: [.25, 1],
				}),
			butler_talk_left: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [17,20],
					direction: -1,
					frameRate: 5,
					hotspot: [.25, 1],
				}),
			butler_shake_hands_left: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [21,22],
					direction: -1,
					frameRate: 5,
					hotspot: [.25, 1],
				}),
			butler_shake_hands_talk_left: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [22,25],
					direction: -1,
					frameRate: 5,
					hotspot: [.25, 1],
				}),
			butler_angry_left: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [41],
					direction: -1,
					hotspot: [.25, 1],
				}),
			butler_angry_right: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [41],
					hotspot: [.25, 1],
				}),
			butler_talk_angry_left: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [41,44],
					direction: -1,
					frameRate: 5,
					hotspot: [.25, 1],
				}),
			butler_talk_angry_right: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [41,44],
					frameRate: 5,
					hotspot: [.25, 1],
				}),
			butler_kick_right: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [45],
					frameRate: 5,
					hotspot: [.25, 1],
				}),
			butler_kick_left: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [45],
					direction: -1,
					frameRate: 5,
					hotspot: [.25, 1],
				}),
			butler_kick_right_still: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [46],
					hotspot: [.25, 1],
				}),
			butler_kick_left_still: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [46],
					direction: -1,
					hotspot: [.25, 1],
				}),
			butler_surprised_right_still: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [47],
					hotspot: [.25, 1],
				}),
			butler_surprised_left_still: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [47],
					direction: -1,
					hotspot: [.25, 1],
				}),
			butler_surprised_right_talk: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [47,48],
					frameRate: 8,
					hotspot: [.25, 1],
				}),
			butler_surprised_left_talk: await engine.addTexture({
					url: "assets/butler.png",
					collision_url: "assets/butler.png",
					cols: 10, rows: 6,
					range: [47,48],
					direction: -1,
					frameRate: 8,
					hotspot: [.25, 1],
				}),
			joker: await engine.addTexture({
				url: "assets/joker.png",
				collision_url: "assets/joker.png",
				cols:1,rows:2,
				range:[0,1],
				hotspot: [.5,1],
			}),
		};

		const I = gender === "T" ? "We" : "I";
		const me = gender === "T" ? "us" : "me";


		//	inventory		
		this.inventory = this.data.inventory ?? (this.data.inventory = []);
		this.inventoryIcons = {};
		this.inventoryDetails = {
			note: {
				actions: [
					{ name: "read", message: () => `It's a letter. It says: "You've been invited to the IMPOSSIBLE ROOM! A room that's impossible to escape."`,
						default: true,
					},
					{
						name: "look",
						action: () => {
							this.engine.setGame(new Selection());
						},
					},
				],
			},
			key_turd: {
				name: "key",
				defaultCommand: (item, target) => `insert ${item.name} into ${target.name}.`,
				actions: [
					{ name: "look", message: () => "This is the entrance key. It has a distinct smell to it.",
					},
					{ name: "eat", condition: () => !this.entrance, message: () => `${I} swallowed the key. Tasted like rotten eggs!...`, 
						default: true,
						action: key => {
							this.removeFromInventory("key_turd");
							this.audio.eat.play();
							this.showBubble(key.pendingMessage);
							key.pendingMessage = null;
							this.data.ateKey = true;
						},
					},
				],
			},
			key: {
				defaultCommand: (item, target) => `insert ${item.name} into ${target.name}.`,
				actions: [
					{ name: "look", message: () => `${I} picked up some keys that didn't belong to ${me} from under a mat.`,
					},
					{ name: "eat", condition: () => this.entrance && !this.entrance.properties.unlocked, message: () => `${I} swallowed the key. Now, this game is truly IMPOSSIBLE!`, 
						default: true,
						action: key => {
							this.removeFromInventory("key");
							this.audio.eat.play();
							this.showBubble(key.pendingMessage);
							key.pendingMessage = null;
							setTimeout(() => this.gameOver(), 6000);
							this.data.ateKey = true;
							this.onDead();
						},
					},
					{ name: "eat", condition: () => !this.entrance || this.entrance.properties.unlocked, message: () => `${I} swallowed the key. Tasted like metal.`, 
						default: true,
						action: key => {
							this.removeFromInventory("key");
							this.audio.eat.play();
							this.showBubble(key.pendingMessage);
							key.pendingMessage = null;
							this.data.ateKey = true;
						},
					},
				],
			},
			cigarette: {
				actions: [
					{ name: "look", message: () => `It's a cigarette butt. I'm not a regular smoker, but I don't think it will kill ${me}.` },
					{ name: "smoke", message: () => `Let ${me} take a puff of that cigarette.`,
						default: true,
						action: item => {
							this.showBubble(item.pendingMessage, () => {
								this.monkor.smoking = engine.lastTime;
								this.monkor.setProperty("paused", engine.lastTime);
							});
							item.pendingMessage = null;
						},
					},
				],
			},	
			file: {
				name: () => this.file.properties.name,
				actions: [
					{ name: "look", message: () => `${I} found this ${this.file.properties.name} on the floor. ${I} have no idea how it got there.` },
				],
			},
			joker_card: {
				actions: [
					{ name: "look", message: () => `It's a Joker card. The Joker left this in my pocket.` },
					{ name: "read", message: "I read: Use this card to return to the joker's room.", },
					{
						name: "use", condition: () => this.constructor.name !== this.monkor.properties.joker,
						action: item => {
							if (this.monkor.properties.joker) {
								this.audio.drink.play();
								const classObj = nameToClass(this.monkor.properties.joker);
								this.monkor.setProperty("jokerReturn", this.constructor.name);
								engine.setGame(new classObj());
							}
						},
					},
				],
			},
			joker: {
				actions: [
					{ name: "look", message: () => `It's a Joker.` },
					{ name: "talk",
						action: item => {
							this.startDialog(null, [
								{
									message: `Howdy?`,
									voiceName: "Hysterical",
								},
								{
									responses: [
										{
											response: "What's so funny?",
											topic: "funny",
										},
										{
											condition: () => this.canUseJoker(),
											response: "How do I get out of this room?",
											topic: "get_out",
										},
										{
											response: "I'll be on my way",
										},
									],
								},
								{
									message: `Ok.`,
									voiceName: "Hysterical",
									exit: true,
								},
								{
									topic: "unwanted-item",
									message: `No thanks.`,
									voiceName: "Hysterical",
									next: previousIndex => previousIndex,
								},
								{
									topic: "funny",
									message: `You.`,
									voiceName: "Hysterical",
									exit: true,
								},
								{
									topic: "get_out",
									message: `Use me.`,
									voiceName: "Hysterical",
									exit: true,
								},						
							]);

						},
					},
					{
						name: "put down", condition: () => this.canUseJoker(),
						action: item => {
							this.setRightOpened(true);
							this.removeFromInventory("joker");
							if (!this.isBatmanRoom()) {
								this.addToInventory("joker_card");
							}
							this.monkor.setProperty("joker", this.constructor.name);
							this.monkor.setProperty("joker_position", this.monkor.x);
							this.joker.changePosition(this.monkor.properties.joker_position, this.joker.y, this.joker.z, engine.lastTime);
							this.joker.setProperty("pickedUp", false);
							this.audio.hit.play();
							if (!this.isBatmanRoom()) {
								setTimeout(() => {
									this.showBubble(`Interesting. I can put down the joker to exit a room.`);
								}, 500);
							}
						},
					},
				],
			},	
			gum: {
				actions: [
					{ name: "look", message: () => this.monkor.properties.chewed ? `It's a chewing gum, half masticated by me and a random person.` : `It's a chewing gum. I wonder if it still has some flavor.` },
					{ name: "chew", message: () => `Let ${me} chew that gum.`,
						default: true,
						action: item => {
							this.removeFromInventory("gum");
							this.showBubble(item.pendingMessage, () => {
								this.audio.eat.play();
								this.monkor.setProperty("paused", engine.lastTime);
								this.monkor.chewing = engine.lastTime;
								this.monkor.setProperty("chewed", engine.lastTime);
								setTimeout(() => {
									this.addToInventory("gum");
									this.monkor.setProperty("paused", null);
									delete this.monkor.chewing;
									this.showBubble("It tastes like a donkey's anus.");
								}, 3000);
							});
							item.pendingMessage = null;
						},
					},
				],
			},
			crab: {
				actions: [
					{
						name: "put it back",
						action: item => {
							this.putItemBack(item.name);
						},
					},
					{
						name: "look",
						message: item => `It's an idol of a ${item.name}.`,

					},
				],
			},
			koala: {
				actions: [
					{
						name: "put it back",
						action: item => {
							this.putItemBack(item.name);
						},
					},
				],
			},
			cat: {
				actions: [
					{
						name: "put it back",
						action: item => {
							this.putItemBack(item.name);
						},
					},
				],
			},
			bird: {
				actions: [
					{
						name: "put it back",
						action: item => {
							this.putItemBack(item.name);
						},
					},
				],
			},
			dog: {
				actions: [
					{
						name: "put it back",
						action: item => {
							this.putItemBack(item.name);
						},
					},
				],
			},
			pig: {
				actions: [
					{
						name: "put it back",
						action: item => {
							this.putItemBack(item.name);
						},
					},
				],
			},
			turtle: {
				actions: [
					{
						name: "put it back",
						action: item => {
							this.putItemBack(item.name);
						},
					},
				],
			},
			horse: {
				actions: [
					{
						name: "put it back",
						action: item => {
							this.putItemBack(item.name);
						},
					},
				],
			},
			snake: {
				actions: [
					{
						name: "put it back",
						action: item => {
							this.putItemBack(item.name);
						},
					},
				],
			},
		};

		this.defaultCommand = (item, target) => `use ${item.name} on ${target.name}`;

		document.getElementById("controls").style.display = "";
		document.getElementById("player-name").innerText = (this.data.name || "Monkor").split(" ")[0];

		await this.addListeners(engine);

		this.inventoryIcons = {
			...this.inventoryIcons,
			key: "🗝",
			key_turd: "💩",
			cigarette: "🚬",
			note: "📜",
			gum: "🧠",
			joker_card: "🃏",
			joker: "🤪",
			crab: "🦀",
			koala: "🐨",
			cat: "🐈",
			bird: "🐦",
			dog: "🐕",
			pig: "🐖",
			turtle: "🐢",
			horse: "🐴",
			snake: "🐍",
			file: "📄",
		};

		this.showVoices();

		if (!this.inventory.contains("note")) {
			this.addToInventory("note");
		}

		const playerName = (this.core.playerOverlay.inception ? null : localStorage.getItem("playerName"));
		document.getElementById("player-name").textContent =
			!playerName || playerName.toUpperCase().startsWith("MONKOR") ? "Monkor" : playerName;

		if (!this.data.name) {
			this.data.name = localStorage.getItem("playerName");
		}

	}

	isBatmanRoom() {
		return false;
	}

	putItemBack(item) {
		
	}

	canUseJoker() {
		return false;
	}

	addMonkor() {
		const { gender } = this.data;

		const Iam = gender === "T" ? "We are" : "I am";
		const me = gender === "T" ? "us" : "me";
		const I = gender === "T" ? "We" : "I";

		this.joker = this.spriteFactory.create({
			name: "Joker",
			anim: this.atlas.joker,
			size: [50, 50],
			x: 500, y: 340,
			opacity: 0,
		}, {
			actions: [
				{ name: "talk",
					action: joker => {
						this.monkor.goal.x = this.joker.x < this.monkor.x ? this.joker.x - 30 : this.joker.x + 30;
						this.startDialog(joker, [
							{
								message: `Howdy?`,
								voiceName: "Hysterical",
								onStart: person => person.talking = engine.lastTime,
								onEnd: person => person.talking = 0,
							},
							{
								responses: [
									{
										response: "What's so funny?",
										topic: "funny",
									},
									{
										condition: () => this.isJokerRoom(),
										response: "How do I get out of this room?",
										topic: "get_out",
									},
									{
										response: "I'll be on my way",
									},
								],
							},
							{
								message: `Ok.`,
								voiceName: "Hysterical",
								onStart: person => person.talking = engine.lastTime,
								onEnd: person => person.talking = 0,
								exit: true,
							},
							{
								topic: "funny",
								message: `You.`,
								voiceName: "Hysterical",
								onStart: person => person.talking = engine.lastTime,
								onEnd: person => person.talking = 0,
								exit: true,
							},
							{
								topic: "get_out",
								message: `Take me.`,
								voiceName: "Hysterical",
								onStart: person => person.talking = engine.lastTime,
								onEnd: person => {
									person.talking = 0;
									person.setProperty("canTake", true);
								},
								exit: true,
							},						
						]);
					},
				},
				{
					name: "take", message: `Alright, ${Iam} taking you with ${me}.`,
					condition: joker => joker.properties.canTake,
					action: item => {
						this.monkor.setProperty("paused", true);
						this.showBubble(item.pendingMessage, () => {
							setTimeout(() => {
								item.setProperty("pickedUp", true);
								this.setRightOpened(this.isJokerRoom() || this.isRoomSolved());
								this.removeFromInventory("joker_card");
								this.addToInventory("joker");
								this.monkor.setProperty("joker", null);
								this.audio.pickup.play();
								this.monkor.setProperty("paused", false);
							}, 500);
						});
						item.pendingMessage = null;
					},
				},
			],			
			onChange: {
				pickedUp: (joker, pickedUp) => {
					if (!this.joker.properties.canTake) {
						joker.changeOpacity(0, engine.lastTime);
						return;
					}
					joker.changeOpacity(pickedUp || this.monkor.properties.joker !== this.constructor.name ? 0 : 1, engine.lastTime);
				},
			},
		});




		this.sceneData.monkor = this.sceneData.monkor ?? { x:50, y:380 };
		this.monkor = this.spriteFactory.create({
			name: "monkor",
			x: this.sceneData.monkor.x, y: this.sceneData.monkor.y,
			size: [128, 128],
			anim: this.atlas.monkor_still,
		}, {
			self: true,
			onChange: {
				paused: (monkor, paused) => {
					this.setInventoryVisibility(!paused);
					this.setControlVisibility(!paused);
				},
				joker: (monkor, joker) => {
					this.onJoker(joker);
				},
			},
			goal: {
				x:this.sceneData.monkorGoal.x ?? this.sceneData.monkor.x,
				y:this.sceneData.monkorGoal.y ?? this.sceneData.monkor.y,
			},
		});

		this.mouse = this.spriteFactory.create({
			name: "mouse",
			size: [24, 24],
			anim: this.atlas.mouse,
			opacity: 0,
		}, {
			goal: { x:0, y:0 },
		});

		this.file = this.spriteFactory.create({
			name: "file",
			size: [40, 40],
			anim: this.atlas.file,
			opacity: 0,
		}, {
			actions: [
				{
					name: "look",
					message: file => "It's a " + file.properties.name,
				},
				{ name: "pick up", message: file => `Cool, ${I} just found a ${this.file.properties.name}.`,
					action: item => {
						item.setProperty("pickedUp", true);
						this.addToInventory("file");
						this.audio.pickup.play();
						this.showBubble(item.pendingMessage);
						item.pendingMessage = null;
					},
				}
			],
			onChange: {
				pickedUp: (file, pickedUp) => {
					file.changeOpacity(file.properties.dropped && !pickedUp ? 1 : 0, this.engine.lastTime);
				},
				dropped: (file, dropped) => {
					console.log(dropped, file.properties.pickedUp, this.engine.lastTime);
					file.changeOpacity(dropped && !file.properties.pickedUp ? 1 : 0, this.engine.lastTime);
					if (dropped) {
						this.removeFromInventory("file");
					}
				},
			},
		});

		this.piano = this.spriteFactory.create({
			name: "piano",
			opacity: 0,
			size: [300, 200],
			anim: this.atlas.piano,
		});



		this.monkor.speed = 1;

		if (this.monkor.x > 850 && this.monkor.goal.x < 850) {
			this.walkingThrough = true;
			this.monkor.setProperty("paused", true);
			this.setRightOpened(true);
			this.monkor.onStill = monkor => {
				this.walkingThrough = false;
				monkor.setProperty("paused", false);
				this.setRightOpened(this.monkor.properties.joker === this.constructor.name || this.isRoomSolved());
			};

		} else {
			this.monkor.setProperty("paused", false);
		}

		if (this.monkor.properties.joker_position) {
			this.joker.changePosition(this.monkor.properties.joker_position, this.joker.y, this.joker.z, this.engine.lastTime);
		}		
	}

	moveMonkor(monkor, path, onDone) {
		let index = 0;
		const onStill = monkor => {
			const nextGoal = path[index];
			if (!nextGoal) {
				onDone(monkor);
				return;
			}

			const x = nextGoal[0] || monkor.x;
			const y = nextGoal[1] || monkor.y;

			const dx = (x - monkor.x);
			const dy = (y - monkor.y);
			const dist = Math.sqrt(dx * dx + dy * dy);
			if (dist) {
				monkor.goal.x = x;
				monkor.goal.y = y;
				monkor.onStill = onStill;
			} else {
				index++;
				onStill(monkor);
			}
		};
		onStill(monkor);
	}

	async postInit() {
		this.sceneData.monkorGoal = this.sceneData.monkorGoal || {... this.sceneData.monkor};
		this.addMonkor();

		for (let id in this.inventoryDetails) {
			if (!this.inventoryDetails[id].name) {
				this.inventoryDetails[id].name = id;
			}
			this.inventoryDetails[id].id = id;
		}

		for (let id in this.inventoryIcons) {
			this.engine.cursorManager.addEmojiRule(id, this.inventoryIcons[id]);
		}
		this.updateInventory();

		if (localStorage.getItem("joker")) {
			this.joker.setProperty("canTake", true);
			this.monkor.setProperty("joker", localStorage.getItem("joker"));
			this.joker.setProperty("pickedUp", false);
			this.addToInventory("joker_card");
			this.removeFromInventory("joker");
			if (this.isJokerRoom() || this.monkor.properties.joker === this.constructor.name) {
				this.setRightOpened(true);
			}
		}

		this.onFrameSprites = this.engine.spriteCollection.spritesFilteredBy("onFrame");
		this.core.sidebar.enableSidebar(true);
		await super.postInit();
	}

	putBackJoker() {
		if (this.inventory.indexOf("joker") >= 0) {
			this.removeFromInventory("joker");
			if (this.batman) {
				this.batman.setProperty("liftJoker", true);
			}
		}
	}

	isRoomSolved() {
		return false;
	}

	onJoker(putDown) {
	}

	async onExit(engine) {
		await super.onExit(engine);
		if (this.f) {
			this.antiGameOver();
		}
		document.getElementById("controls").style.display = "none";
		this.removeListeners(engine);
		this.clearActions();
		this.showSubject(null);

		for (let a in this.audio) {
			this.audio[a].stop();
		}
		window.speechSynthesis.cancel();
		this.showBubble(null);
		this.setInventoryVisibility(false);
		this.setControlVisibility(false);
		this.setDialogVisibility(false);
		this.dragDrop.clear();
		this.core.sidebar.updateSidebar(null);
		return super.onExit(engine);
	}

	clearActions() {
		const subjectActions = document.getElementById("subject-actions");
		if (subjectActions) {
			subjectActions.innerText = "";
		}
	}

	getMusic() {
		return "audio/weirdsong.mp3";
	}

	shouldResetAudio() {
		return false;
	}

	async addListeners(engine) {
		const audio = await engine.music.getAudio(this.getMusic());
		/* Addd audio listener */
		engine.keyboardHandler.addKeyUpListener("m", e => {
			if (this.shouldResetAudio()) {
				audio.currentTime = 0;
			}
			this.setAudio(audio, audio.paused, .5);
		});

		engine.keyboardHandler.addKeyUpListener("v", e => {
			this.setVoice(!engine.muteVoice);
		});

		engine.keyboardHandler.addKeyUpListener("s", e => {
			this.setSFX(!engine.muteSFX);
		});

		if (!this.domListeners) {
			this.domListeners = {};
		}

		document.getElementById("mute-toggle").addEventListener("click", this.domListeners["mute-toggle"] = () => {
			if (this.shouldResetAudio()) {
				audio.currentTime = 0;
			}
			this.setAudio(audio, audio.paused, .5);
//			this.setVoice(!audio.paused, true);
		});

		document.getElementById("sfx-toggle").addEventListener("click", this.domListeners["sfx-toggle"] = () => {
			this.setSFX(!engine.muteSFX);
		});

		document.getElementById("voice-mute-toggle").addEventListener("click", this.domListeners["voice-mute-toggle"] = () => {
			this.setVoice(!engine.muteVoice);
		});

		document.getElementById("mouse").addEventListener("click", this.domListeners["mouse"] = () => {
			this.audio.mouse.play();
		});

		// engine.keyboardHandler.addKeyDownListener("r", e => {
		// 	const msg = "Actually I lied. Pressing R does nothing.";
		// 	if (window.speechSynthesis) {
		// 		const utterance = engine.getUterrance(msg, ["Mei-Jia", "Google UK English Female"]);
		// 		window.speechSynthesis.speak(utterance);			
		// 	}
		// 	document.getElementById("pressing-r").innerText = msg;
		// });
	}

	isJokerRoom() {
		return false;
	}

	removeListeners(engine) {
		engine.keyboardHandler.clearListeners();
		for (let d in this.domListeners) {
			document.getElementById(d).removeEventListener("click", this.domListeners[d]);
		}
		this.domListeners = {};
	}

	onDragOver(e) {
	}

	onDropOnOverlay(e) {
		const item = e.dataTransfer.getData("item");
		const { lastTime, canvas } = this.engine;
		const { pageX, pageY, buttons } = e;
		const rect = canvas.getBoundingClientRect();
		const x = (pageX - rect.x) / rect.width * this.engine.viewportWidth,
			  y = (pageY - rect.y) / rect.height * this.engine.viewportHeight;
		if (item === "mouse") {
			const divMouse = document.getElementById("mouse");
			if (x < 0 || x > 800 || y < 0 || y > 400) {
				divMouse.style.opacity = 1;
				return;
			}
			this.mouse.changePosition(x, y, this.mouse.z, lastTime);
			this.mouse.changeOpacity(1, lastTime);
			this.mouse.alive = lastTime;
			divMouse.style.opacity = 0;
			divMouse.setAttribute("draggable", "");
			divMouse.style.animation = "";
		}
		if (e.dataTransfer.files.length > 0) {
			if (x < 0 || x > 800 || y < 0 || y > 400) {
				return;
			}
			this.file.changePosition(x, y, this.file.z, lastTime);
			this.file.setProperty("name", e.dataTransfer.files[0].name.split(".")[0]);
			this.file.setProperty("dropped", lastTime);
			this.file.setProperty("pickedUp", null);
			// console.log(e.dataTransfer.files[0].name);
		}
	}

	resetMouse() {
		const divMouse = document.getElementById("mouse");
		divMouse.style.opacity = 1;
		divMouse.setAttribute("draggable", "true");		
	}

	resetGame() {
		this.engine.resetGame(this.core.name);
	}

	updateFile(time) {
		if (this.file && this.file.properties.dropped) {
			const walkArea = this.savedWalkArea || (this.savedWalkArea = this.getWalkArea());
			const top = walkArea.top || 0;
			const bottom = walkArea.bottom || 400;
			const falling = this.file.y < top ? (time - this.file.properties.dropped) / 100 : 0;
			const dx = 0;
			const dy = falling ? falling * falling : 0;
			const dist = Math.sqrt(dx * dx + dy * dy);
			const speed = falling ? dy : Math.min(dist, 5);
			if (speed > .1) {
				this.file.changePosition(this.file.x + speed * dx / dist, Math.min(400, this.file.y + speed * dy / dist), this.file.z, time);
			}
		}
	}

	updateMouse(time) {
		if (this.mouse && this.mouse.alive) {
			const walkArea = this.mouse.eating ? {} : this.savedWalkArea || (this.savedWalkArea = this.getWalkArea());
			const top = walkArea.top || 0;
			const bottom = walkArea.bottom || 400;
			const falling = this.mouse.y < top ? (time - this.mouse.alive) / 100 : 0;
			if (!this.mouse.lastAction || time - this.mouse.lastAction > 1300) {
				if (!this.mouse.eating) {
					this.mouse.goal.x = this.mouse.putBack && time - this.mouse.putBack > 4000 ? 0 : 40 + 720 * Math.random();
					this.mouse.goal.y = this.mouse.putBack && time - this.mouse.putBack > 4000 ? 500 : top + (bottom - top) * Math.random();
					this.mouse.lastAction = time + Math.random() * 500;
				}
			}
			const dx = falling ? 0 : this.mouse.goal.x - this.mouse.x;
			const dy = falling ? falling * falling : this.mouse.goal.y - this.mouse.y;
			const dist = Math.sqrt(dx * dx + dy * dy);
			const speed = falling ? dy : Math.min(dist, 5);
			if (speed > .1) {
				this.mouse.changeDirection(dx < 0 ? -1 : 1, time);
				this.mouse.changeAnimation(this.mouse.eating ? this.atlas.mouse_eat : this.atlas.mouse_run, time);
				this.mouse.changePosition(this.mouse.x + speed * dx / dist, Math.min(400, this.mouse.y + speed * dy / dist), this.mouse.z, time);
			} else {
				this.mouse.changeAnimation(this.atlas.mouse, time);
				if (this.mouse.onStill) {
					const onStill = this.mouse.onStill;
					this.mouse.onStill = null;
					onStill(this.mouse);
				}
			}
		}
	}

	antiGameOver() {
		document.getElementById("restart").removeEventListener("click", this.f);
		this.f = null;
		document.getElementById("restart").style.display = "none";
		document.getElementById("game-over").style.display = "none";
		document.getElementById("game-over-message").style.display = "none";
	}

	gameOver() {
		this.paused = true;
		if (this.core.playerOverlay.inception) {
			return;
		}

		const sidebar = document.getElementById("sidebar");
		sidebar.style.display = "none";

		document.getElementById("restart").style.display = "block";
		document.getElementById("game-over").style.display = "block";
		document.getElementById("restart").addEventListener("click", this.f = e => {
			document.getElementById("restart").removeEventListener("click", this.f);
			document.getElementById("restart").style.display = "none";
			document.getElementById("game-over").style.display = "none";
			document.getElementById("game-over-message").style.display = "none";
			this.resetMouse();
			this.resetGame(this.core.name);
			this.engine.setGame(new GameTitle());
		});
	}

	active() {
		if (this.paused) {
			return false;
		}
		if (!this.monkor || this.monkor.properties.paused
			|| this.monkor.dead || this.mouse.alive
			// || this.monkor.anim === this.atlas.monkor_talk
			// || this.monkor.anim === this.atlas.monkor_talk_2
			) {
			return false;
		}
		return true;
	}

	handleMouse(e, x, y) {
		if (e.target.id === "im" || e.target.id === "title") {
			if (this.onMouseTitle) {
				this.onMouseTitle(e);	
			}
			return;		
		}
		if (!this.active()) {
			const cursor = "wait";
			if (this.cursor !== cursor) {
				this.cursor = cursor;
				this.engine.cursorManager.changeCursor(cursor);
			}
			return;
		}
		if (e.type === "click") {
			if (e.target.classList.contains("chat-selection")
				&& !e.target.classList.contains("disabled")
				&& !e.target.classList.contains("selected")) {
				this.selectDialog(e.target.id);
			}
			return;
		}
		if (this.selectedItem && this.lastHovering && this.lastHovering.self && e.type !== "mousemove") {
			if (e.type === "mouseup") {
				const itemDetails = this.inventoryDetails[this.selectedItem];

				const action = itemDetails.actions.filter(action => {
					if (action.condition && !action.condition(itemDetails)) {
						return false;
					}
					return action.default;
				})[0] || this.itemActionOnTarget(this.selectedItem, this.lastHovering);

				if (action) {
					this.performAction(action, this.lastHovering);
				}
			}
			return;
		}

		if (this.dialog) {
			return;
		}

		const { engine } = this;
		const { canvas, lastTime } = engine;
		const { buttons } = e;
		if (x < 0 || y < 0 || x > engine.viewportWidth || y > engine.viewportHeight) {
			return;
		}

		if (buttons || e.type !== "mousemove") {
			if (!this.monkor.busy) {
				const walkArea = this.getWalkArea();
				const left = walkArea.left || 0;
				const right = walkArea.right || 800;
				const top = walkArea.top || 0;
				const bottom = walkArea.bottom || 400;


				this.monkor.goal.x = Math.max(left + 40, Math.min(x, right - 40));
				this.monkor.goal.y = Math.max(top, Math.min(bottom, y));

				this.sceneData.monkorGoal.x = this.monkor.goal.x;
				this.sceneData.monkorGoal.y = this.monkor.goal.y;

				this.monkor.speed = buttons ? 2 : 1;
				if(!buttons) {
					const diff = lastTime - this.lastMouseUp;
					if (diff < 250) {
						this.monkor.speed = 2;
					}
					this.lastMouseUp = lastTime;
				}
			}
		}

		let hovering = null;
		for (let i = engine.spriteCollection.size() - 1; i >= 0; i--) {
			const sprite = engine.spriteCollection.get(i);
			if (sprite.opacity <= 0) {
				continue;
			}
			if (sprite.actions || sprite.onMouseDown || sprite.self && this.selectedItem) {
				const collisionBox = sprite.getCollisionBox(lastTime);
				if (collisionBox && collisionBox.containsPoint(x, y)) {
					hovering = sprite;
					break;
				}
			}
		}


		if (e.type === "mousedown") {
			this.monkor.touched = hovering;
			this.lastMouseDown = lastTime;
			this.showActions(null);
			if (!this.finishedSpeech(this.monkor)) {
				this.speechBubble.style.opacity = 0;
			}
			if (this.selectedItem && hovering) {
				const itemDetails = this.inventoryDetails[this.selectedItem];
				this.monkor.pendingAction = this.getActionWithItem(hovering, itemDetails);
				this.showActions(itemDetails, hovering);
			} else {
				this.monkor.pendingAction = null;
			}
			if (hovering && hovering.onMouseDown) {
				hovering.onMouseDown(hovering, e, x, y);
			}
			if (this.onMouseDown) {
				this.onMouseDown(e, x, y);
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
			if (hovering && hovering.onMouseUp) {
				hovering.onMouseUp(hovering, e);
			}
			if (this.onMouseUp) {
				this.onMouseUp(e);
			}
		} else if (e.type === "mousemove") {
			if (hovering && hovering.onMouseMove) {
				hovering.onMouseMove(hovering, e, x, y);
			}
			if (this.onMouseMove) {
				this.onMouseMove(e, x, y);
			}
		}
		this.showSubject(this.monkor.target || hovering);

		const cursor = !this.selectedItem && hovering ? (hovering.cursor || this.getPointerCursor()) : "";
		if (this.cursor !== cursor) {
			this.cursor = cursor;
			this.engine.cursorManager.changeCursor(cursor);
		}

		if (this.selectedItem && e.type === "mousedown") {
			this.updateInventory(null);
		}

		if (this.lastHovering !== hovering) {
			this.lastHovering = hovering;
			this.checkItem(hovering);
			this.setSelection(this.selectedItem, true);
		}

		// const now = performance.now();
		// const diffTime = performance.now() - now;
		// this.engine.perfDiff = Math.max(diffTime, this.engine.perfDiff||0);
	}

	showSubject(subject) {
		if (!this.subjectNameDiv) {
			this.subjectNameDiv = document.getElementById("subject-name");
		}
		const subjectText = !subject ? "" : subject.properties && subject.properties.name ? subject.properties.name : typeof(subject.name) === "function" ? subject.name(subject) : subject.name;
		if (this.subjectText !== subjectText) {
			this.subjectText = subjectText;
			this.subjectNameDiv.innerText = this.subjectText;
			this.subjectNameDiv.style.display = subjectText !== "" ? "" : "none";
		}
	}

	checkItem(hovering) {
		if (this.selectedItem) {
			const itemDetails = this.inventoryDetails[this.selectedItem];
			this.showActions(itemDetails, hovering);
		}
	}

	onClickWithItem(target, item) {
//		console.log(item, target);
	}

	selectTarget(target) {
		const { engine } = this;

		if (!this.subjectDiv) {
			this.subjectDiv = document.getElementById("subject");
		}
		if (this.monkor.target !== target) {
			this.monkor.target = target;
			if (this.monkor.target) {
				this.audio.beep.play();
				this.showSubject(this.monkor.target);
				this.subjectDiv.classList.add("selected");
				if (this.monkor.target.reachable) {
					this.showActions(this.monkor.target);
				}
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
				if (this.dialog) {
					this.addAction(target, {
						name: "give", action: item => {
							this.showBubble(`Would you like this ${item.name}?`, () => {
								const dialogIndex = this.getDialogIndexFromTopic(item.name);
								this.continueDialog(null, dialogIndex || "unwanted-item");
							});
						},
					}, false);
				} else if (this.monkor.pendingAction && hovering) {
					const command = this.monkor.pendingAction.command || hovering.defaultCommand || target.defaultCommand || this.defaultCommand;
					this.addAction(hovering, this.monkor.pendingAction, true, command(target, hovering));
				} else {
					if (this.showingTarget.actions) {
						this.showingTarget.actions.forEach(action => {
							const command = action.command || hovering && hovering.defaultCommand || target.defaultCommand;
							this.addAction(target, action, action.default && hovering && hovering.self);//, command && hovering ? command(target, hovering) : null);
						});
					}

					if (hovering) {
						this.checkActionsWithItem(hovering, target);
					}
				}
			}
		}
	}

	itemActionOnTarget(item, target) {
		const { gender } = this.data;
		const I = gender === "T" ? "We" : "I";
		return {
			item: item.name,
			message: `${I} cannot use the ${item.name} on the ${target.name}.`,
		};
	}

	getActionWithItem(target, item) {
		if (target === item || !target.actions) {
			return null;
		}
		return target.actions.filter(action => {
			if (action.condition && !action.condition(target)) {
				return false;
			}
			const actionItems = Array.isArray(action.item) ? action.item : [action.item];
			return actionItems.contains(item.id);
		})[0] || this.itemActionOnTarget(item, target);
	}

	checkActionsWithItem(target, item) {
		const action = this.getActionWithItem(target, item);
		if (!action) {
			return;
		}
		const command = action.command || target.defaultCommand || item.defaultCommand || this.defaultCommand;
		this.addAction(target, action, true, command(item, target));
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
		div.textContent = messageOverride || (typeof(action.name)==="function" ? action.name(action) : action.name);
		div.addEventListener("click", e => {
			this.performAction(action, target);
		});
	}

	performAction({name, condition, message, action, lookup}, target) {
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
		if (lookup) {
			this.monkor.lookupUntil = this.engine.lastTime + lookup;
		}
		this.monkor.pendingAction = null;
		this.selectTarget(null);
		this.updateInventory();
		this.showActions(null);
		this.showSubject(null);
	}

	showBubble(msgOrNull, callback, voiceName, sprite, onStart, secondsAfterEnd) {
		const { engine } = this;
		const { lastTime, canvas } = engine;
		const speechBubble = this.speechBubble || (this.speechBubble = document.getElementById("speech-bubble"));
		const msg = typeof msgOrNull === "function" ? msgOrNull().trim() : (msgOrNull ? msgOrNull.trim() : null);
		sprite = sprite || this.monkor;
		if (sprite) {
			sprite.speechStarted = 0;
			sprite.speechPause = 0;
			sprite.currentSpeech = "";
			sprite.lastCharacter = 0;
			sprite.characterIndex = 0;
			sprite.finishedSpeech = 0;
			sprite.speaker = Math.random() < .5 ? 1 : 2;
		}
		if (msg) {
			if (sprite && !sprite.scared) {
				speechBubble.style.opacity = 1;

			}
			this.updateBubble(speechBubble, sprite);

			const { gender } = this.data;
			const genderToVoice = {
				M: "Daniel",
				W: "Karen",
				T: "Alex",
			};
			voiceName = voiceName || genderToVoice[gender];
			const ignoreSpeechBoundary = voiceName === "Thomas";

			this.startSpeechSynthesis(msg, voiceName, callback, sprite, onStart, ignoreSpeechBoundary, secondsAfterEnd);
			speechBubble.innerText = "";
		} else {
			speechBubble.style.opacity = 0;
		}
		if (sprite) {
			sprite.speech = msg;
		}
	}

	showVoices() {
		if (!this.engine.showedVoices) {
			const voices = window.speechSynthesis.getVoices().map(voice=>voice.name);
			if (!voices || !voices.length) {
				return;
			}
			console.log(voices);
			this.engine.showedVoices = true;
			const voiceDrop = document.getElementById("voice-drop");
			voiceDrop.addEventListener("change",e => {
				this.core.voiceManager.swapVoice(e.currentTarget.value);
			});
			voices.forEach(voice => {
				const option = voiceDrop.appendChild(document.createElement("option"));
				option.setAttribute("value", voice);
				option.textContent = voice;
			});
			if (engine.defaultVoiceReplacement) {
				voiceDrop.value = engine.defaultVoiceReplacement;
			}
		}
	}

	startSpeechSynthesis(msg, voiceName, callback, sprite, onStart, ignoreSpeechBoundary, secondsAfterEnd) {
		const { engine } = this;
		const { lastTime } = engine;
		sprite = sprite || this.monkor;
		const utterance = this.core.voiceManager.getUterrance(msg, voiceName, sprite === this.monkor);
		const reallyIgnoreSpeechBoundary = ignoreSpeechBoundary || utterance && utterance.replacedVoice;
		if (reallyIgnoreSpeechBoundary) {
//			console.log("ignore speech boundary.");
		} else if (utterance && utterance.voice.name === voiceName) {
			sprite.speechPause++;
		} else if (utterance && utterance.voice.name.startsWith("Microsoft")) {
			sprite.speechPause+=2;
		}

		const calllbackCaller = callback ? subject => {
			setTimeout(subject => {
				callback(subject);
			}, (secondsAfterEnd || 0) * 1000, subject);
		} : null;

		if (utterance) {
			window.speechSynthesis.lang = 'en-US';
			window.speechSynthesis.cancel();
			window.speechSynthesis.speak(utterance);
			utterance.onstart = () => {
				if (onStart) {
					onStart();
				}
				sprite.speechStarted = lastTime;
				sprite.onEndSpeech = calllbackCaller;
			};
			utterance.onboundary = e => {
				if (!reallyIgnoreSpeechBoundary && !sprite.speechHasBoundary) {
					sprite.speechHasBoundary = true;
				}
				this.unblockText(sprite);
			};
		} else {
			sprite.speechStarted = lastTime;
			sprite.onEndSpeech = calllbackCaller;
			sprite.noVoice = true;
		}
	}


	unblockText(sprite) {
		sprite.speechPause--;
	}

	updateBubble(speechBubble, sprite) {
		const { engine } = this;
		const { lastTime, canvas } = engine;
		const collisionBox = sprite.getCollisionBox(lastTime);
		const midX = !collisionBox ? sprite.x : (collisionBox.left + collisionBox.right)/2;
		const topY = !collisionBox ? sprite.y - sprite.size[1] : collisionBox.top;

		speechBubble.style.left = `${Math.max(90, canvas.offsetLeft + midX - speechBubble.offsetWidth/2 - 20)}px`;
		speechBubble.style.bottom = `${window.innerHeight - (canvas.offsetTop + topY - (sprite.bubbleTop || 0) - 30)}px`;
	}

	updateSpeech(time, dt, sprite) {
		const finishedSpeech = this.finishedSpeech(sprite);
		if (finishedSpeech) {
			if (sprite.onEndSpeech) {
				sprite.onEndSpeech();
				sprite.onEndSpeech = null;
			}
			if (time - finishedSpeech > 1000 && sprite.speechStarted) {
				this.showBubble(null, null, null, sprite);
			}
			return;
		}		

		const { speech, speechStarted, lastCharacter } = sprite;
		if (speech && speechStarted && (sprite.speechPause <= 0 || sprite.noVoice)) {
			clearTimeout(sprite.timeout);
			sprite.timeout = 0;
			const textSpeed = (sprite.noVoice ? 50 : 20);
			if (!lastCharacter || (time - lastCharacter) * Math.min(2, dt / 16) >= textSpeed) {
				sprite.lastCharacter = time;
				const char = speech.charAt(sprite.characterIndex);
				sprite.currentSpeech += char;
				const speechBubble = this.speechBubble;
				if (this.speechBubbleText !== sprite.currentSpeech) {
					this.speechBubbleText = sprite.currentSpeech;
					speechBubble.innerText = this.speechBubbleText;
				}
				sprite.characterIndex++;
				if (sprite.noVoice) {
					sprite.speechPause = 0;
				} else if (char === " " && sprite.speechHasBoundary) {
					sprite.speechPause++;
				}
				if (sprite.currentSpeech.length >= speech.length) {
					sprite.finishedSpeech = time;
				}
			}
		} else if (sprite.speechPause >= 1 && !sprite.timeout) {
			sprite.timeout = setTimeout(() => {
				sprite.speechHasBoundary = false;
				sprite.speechPause = 0;
				sprite.timeout = 0;
			}, 1000);
		}
	}

	finishedSpeech(sprite) {
		if (!sprite) {
			return 1;
		}
		const { speech, currentSpeech, speechStarted, finishedSpeech } = sprite;
		return !speechStarted ? 1 : finishedSpeech;
	}

	applyMovement(monkor, mouse, dt, time) {
		const { engine } = this;
		const { lastTime } = engine;

		if (!monkor) {
			return;
		}

		if (mouse && mouse.alive && (mouse.y > 330 || time - mouse.alive > 1000)) {
			if (time - mouse.alive < 3000) {
				const dx = mouse.x - monkor.x;
				monkor.changeAnimation(dx < 0 ? this.atlas.monkor_scared_left : this.atlas.monkor_scared_right, time);
				if (!monkor.scared) {
					monkor.scared = time;
					this.audio.scream.play();
					this.engine.music.getAudio(this.getMusic()).then(audio => {
						this.setAudio(audio, false, 0);
					});
				}
			} else {
				const dx = this.canRunRight() ? -(mouse.x - monkor.x) : -1;
				monkor.changeAnimation(dx < 0 ? this.atlas.monkor_run_left : this.atlas.monkor_run_right, time);
				monkor.changePosition(monkor.x + (dx < 0 ? -4 : 4), monkor.y, monkor.z, time);
				if (monkor.x < 50 && !this.canRunLeft()) {
					monkor.changePosition(monkor.x + 20, monkor.y, monkor.z, time);
				}
				if (!monkor.running_away && this.canRunLeft()) {
					if (dx < 0) {
						this.openLeft();
					}
					monkor.running_away = time;
					if (this.runAwayToPreviousRoom()) {
						setTimeout(() => this.nextLevelLeft(), 3000);					
					} else {
						setTimeout(() => this.gameOver(), 6000);					
						this.onDead();
					}
				}
				if (!this.canRunLeft() && !mouse.putBack || this.shouldPutBack()) {
					mouse.putBack = engine.lastTime;
					this.onPutBack(mouse);

				}
			}

			const rolling = monkor.x > 50 && monkor.x < 700 && this.isCarpetRolling();
			if (rolling) {
				monkor.changePosition(monkor.x - 3.8, monkor.y, monkor.z, time);
			}
			return;
		}


		if (monkor.goingup) {
			const elapsed = Math.max(0, time - monkor.goingup - 500);
			if (elapsed > 0) {
				if (!monkor.walkingup) {
					monkor.walkingup = time;
					this.audio.hit.loop(.2);
				}

				monkor.changeAnimation(this.atlas.monkor_back, time);
				if (!this.properties.impossibleRoomSolved) {
					monkor.changePosition(400, 350 - 30 * (elapsed / 2000), monkor.z, time);
				}
				monkor.changeOpacity(Math.max(0, 1 - (elapsed / 2000)), time);
				if (elapsed > 3000 && !monkor.levelup) {
					this.monkor.levelup = lastTime;
					if (this.upperLevel) {
						this.upperLevel(this);
					}
				}
			}
			return;
		}

		const speed = 2 * monkor.speed;
		const dx = (monkor.goal.x - monkor.x);
		const dy = (monkor.goal.y - monkor.y);
		const dist = Math.sqrt(dx * dx + dy * dy);
		const actualSpeed = Math.min(dist, speed);
		const lookup = this.monkor.lookupUntil && this.monkor.lookupUntil > time || this.monkor.alwaysLookup;
		let anim = lookup ? this.atlas.monkor_back_still : this.atlas.monkor_still;
		if (dist) {
			monkor.changePosition(monkor.x + actualSpeed * dx / dist, monkor.y + actualSpeed * dy / dist, monkor.z, time);
			if (Math.abs(dx) > Math.abs(dy)) {
				anim = dx > 0 ? this.atlas.monkor_right : this.atlas.monkor_left;
			} else if (dy > 0) {
				anim = this.atlas.monkor_front;
			} else {
				anim = this.atlas.monkor_back;
			}
		} else if (!lookup) {
			const finishedSpeech = this.finishedSpeech(this.monkor);
			if (!finishedSpeech && monkor.speechPause <= 0) {
				anim = monkor.speaker == 1 ? this.atlas.monkor_talk_2 : this.atlas.monkor_talk;
			} else if (monkor.smoking) {
				anim = (time / 400) % 10 < 2
					? this.atlas.monkor_puff
					: (time / 400) % 10 < 4
					? this.atlas.monkor_blow
					: this.atlas.monkor_smoke;
				if (time - monkor.smoking >= 5000 && !this.piano.dropping) {
					this.dropPiano(time);
				}
			} else if (this.monkor.shakingHands) {
				anim = dx < 0 || this.monkor.lookLeft ? this.atlas.monkor_shake_left : this.atlas.monkor_shake_right;
			} else if (this.monkor.chewing) {
				anim = this.atlas.monkor_chew;				
			} else if (monkor.lookLeft) {
				anim = this.atlas.monkor_stand_left;
			} else if (monkor.lookRight) {
				anim = this.atlas.monkor_stand_right;
			} else if (monkor.knock) {
				anim = dx < 0 ? this.atlas.monkor_knock_left : this.atlas.monkor_knock_right;
			} else if (monkor.punched) {
				anim = this.atlas.monkor_scared_right;
			} else if (monkor.onStill) {
				const onStill = monkor.onStill;
				monkor.onStill = null;
				onStill(monkor);
			}
		}

		const walking = dist !== 0;
		if (monkor.walking !== walking) {
			monkor.walking = walking;
			if (monkor.walking) {
				this.audio.hit.loop(.2);
			} else {
				this.audio.hit.stop();
			}
		}
		const rolling = monkor.x > 50 && monkor.x < 700 && this.isCarpetRolling();
		if (rolling) {
			monkor.changePosition(monkor.x - 3.86, monkor.y, monkor.z, time);
			if (Math.abs(dist) < 5) {
				monkor.goal.x = monkor.x;
			}
		}
		if (this.joker.x > 50 && this.isCarpetRolling()) {
			this.joker.changePosition(this.joker.x - 3.86, this.joker.y, this.joker.z, time);
		}



		monkor.changeAnimation(anim, time,
			this.monkor.shakingHands || (
				anim === this.atlas.monkor_talk || anim === this.atlas.monkor_talk_2
				? monkor.speechStarted : 0)
		);
		this.sceneData.monkor.x = monkor.x;
		this.sceneData.monkor.y = monkor.y;

		if (monkor.x > 850 && !this.changingLevel && monkor.goal.x === 900) {
			this.changingLevel = true;
			if (monkor.properties.jokerReturn) {
				this.updateJokerLocalStorage();
				const nextRoom = monkor.properties.jokerReturn;
				const classObj = nameToClass(nextRoom);
				engine.setGame(new classObj());
			} else if (this.nextLevelRight) {
				if (!this.butler || this.butler.x > 800) {
					this.updateJokerLocalStorage();
					this.nextLevelRight();
				} else {
					setTimeout(() => {
						this.updateJokerLocalStorage();
						this.nextLevelRight();
					}, 2000);
				}
			}
		}							

		if (monkor.x < -50 && this.nextLevelLeft) {
			this.nextLevelLeft();
		}
	}

	shouldPutBack() {
		return false;
	}

	updateJokerLocalStorage() {
		const joker = !this.isBatmanRoom() && this.monkor.properties.joker === this.constructor.name ? this.constructor.name : null;
		console.log("update joker: " + joker);
		if (joker) {
			localStorage.setItem("joker", joker);
		} else {
			if (localStorage.getItem("joker") === this.constructor.name) {
				localStorage.removeItem("joker");
			}
		}
		this.core.sidebar.updateSidebar(this.constructor.name, localStorage.getItem("joker"));
	}

	runAwayToPreviousRoom() {
		return false;
	}

	onPutBack(mouse, timeout) {
		setTimeout(() => {
			mouse.putBack = 0;
			mouse.alive = 0;
			this.monkor.scared = 0;

			this.restoreMouse(mouse);

		}, timeout || 6000);
	}

	restoreMouse(mouse) {
		mouse.changeOpacity(0, this.engine.lastTime);
		const divMouse = document.getElementById("mouse");
		divMouse.style.opacity = 1;
		divMouse.setAttribute("draggable", "true");
		divMouse.style.animation = "restoremouse .5s";
		setTimeout(() => {
			divMouse.style.animation = "";
		}, 1000);
	}

	walkThrough() {
		this.walkingThrough = true;
		this.monkor.setProperty("paused", this.engine.lastTime);
		this.monkor.goal.x = 900;
		if (this.butler && !this.butlerKeepStill()) {
			this.butler.goal.x = () => this.butler.x + 50;
			this.butler.goal.y = () => this.monkor.y;
			this.butler.onStill = () => {
				this.butler.goal.x = () => this.monkor.x + 50;
				this.butler.goal.y = () => this.monkor.y;
			};
		}
	}

	butlerKeepStill() {
		return false;
	}

	openLeft() {

	}

	setRightOpened(opened) {
	}

	canRunRight() {
		return false;
	}

	canRunLeft() {
		return false;
	}

	isCarpetRolling() {
		return false;
	}

	dropPiano(time) {
		this.piano.dropping = time;
		this.piano.changeOpacity(1, time);
		this.piano.dy = 30;
		this.piano.changePosition(this.monkor.x, this.monkor.y - 1000, this.monkor.z, time);
	}

	updatePiano(time, dt) {
		if (!this.piano || !this.piano.dropping) {
			return;
		}
		if (this.piano.y < this.monkor.y + 20) {
			this.piano.changePosition(this.piano.x, this.piano.y + this.piano.dy * Math.min(2, dt / 16), this.piano.z, time);
		} else if(this.piano.anim !== this.atlas.piano_splash) {
			this.piano.changeAnimation(this.atlas.piano_splash, time);
			this.monkor.changeOpacity(0, time);
			this.monkor.dead = time;
			this.audio.piano.play();
			this.engine.music.getAudio(this.getMusic()).then(audio => {
				this.setAudio(audio, false, 0);
			});
			setTimeout(() => this.gameOver(), 5000);
			this.onDead();
		}
	}

	onDead() {
		const sidebar = document.getElementById("sidebar");
		sidebar.style.display = "none";		
	}

	setAudio(audio, value, volume, ignore) {
		const { gender } = this.data;
		const I = gender === "T" ? "We" : "I";
		audio.volume = volume;
		if (value) {
			document.getElementById("speaker").innerText = "🎵";
			document.getElementById("mute").innerText = "mute music";
			audio.play();
			if (!this.monkor.dead && !this.monkor.scared && !ignore) {
				this.showBubble(`${I} like this music.`);
			}
		} else {
			audio.pause();
			document.getElementById("speaker").innerText = "🚫🎵";
			document.getElementById("mute").innerText = "unmute music";
			if (!this.monkor.dead && !this.monkor.scared && !ignore) {
				this.showBubble(`${I} don't like this music.`);
			}
		}
	}

	setVoice(value, ignore) {
		const { gender } = this.data;
		const I = gender === "T" ? "We" : "I";
		engine.muteVoice = value;
		if (!engine.muteVoice) {
			document.getElementById("voice-speaker").innerText = "😮";
			document.getElementById("voice-mute").innerText = "mute voice";
			if (!this.monkor.dead && !ignore) {
				this.showBubble(`Hello there.`);
			}
		} else {
			document.getElementById("voice-speaker").innerText = "🤫";
			document.getElementById("voice-mute").innerText = "unmute voice";
			if (!this.monkor.dead && !ignore) {
				this.showBubble(`Ok, ${I} will be quiet.`);
			}
		}
	}

	setSFX(value, ignore) {
		engine.muteSFX = value;
		if (!engine.muteSFX) {
			Sound.mute = engine.muteSFX;
			document.getElementById("sfx-speaker").innerText = "🔊";
			document.getElementById("sfx-mute").innerText = "mute SFX";
			if (!ignore) {
				this.audio.jingle.play();
				this.showBubble(`You will now hear sound effects.`);
			}
		} else {
			document.getElementById("sfx-speaker").innerText = "🔇";
			document.getElementById("sfx-mute").innerText = "unmute SFX";
			if (!ignore) {
				this.audio.hit.play(1);
				this.showBubble(`No more sound effect.`);
			}
			Sound.mute = engine.muteSFX;
		}
	}

	checkCollisions(time) {
		const { engine, monkor } = this;
		if (!monkor) {
			return;
		}
		const monkorBox = monkor.getCollisionBox(time);
		const targetBox = monkor.target && monkor.target.getCollisionBox ? monkor.target.getCollisionBox(time) : null;
		if (this.doCollide(monkorBox, targetBox)) {
			if (monkor.pendingAction) {
				this.performAction(monkor.pendingAction, monkor.target);
			} else {
				this.showActions(monkor.target);
			}
		}
	}

	doCollide(box1, box2, time) {
		if (!box1 || !box2) {
			return false;
		}
		return box1.right >= box2.left && box2.right >= box1.left && box1.bottom >= box2.top && box2.bottom >= box1.top;
	}

	getWalkArea() {
		return {};
	}

	addToInventory(item) {
		if (this.inventory.indexOf(item) < 0) {
			this.inventory.push(item);
			this.updateInventory();
		}
	}

	removeFromInventory(item) {
		this.inventory.remove(item);
		this.updateInventory();
	}

	setSelection(item, force) {
		if (this.selectedItem != item || force) {
			this.selectedItem = item;
			this.engine.cursorManager.setCursor(item, this.lastHovering);
		}
	}

	setInventoryVisibility(visible) {
		const actualVisibilty = typeof(visible) === "function" ? visible() : visible;
		const div = document.getElementById("inventory");
		div.style.display = actualVisibilty ? "flex" : "none";
	}

	setControlVisibility(visible) {
		const actualVisibilty = typeof(visible) === "function" ? visible() : visible;
		const div = document.getElementById("controls");
		div.style.display = actualVisibilty ? "" : "none";
		this.core.sidebar.enableSidebar(visible);
	}

	setDialogVisibility(visible, responses) {
		const actualVisibilty = typeof(visible) === "function" ? visible() : visible;

		if (!document.getElementById("conversation")) {
			const div = document.getElementById("container").appendChild(document.createElement("div"));
			div.id = "conversation";
			div.style.position = "absolute";
			div.style.top = "490px";
			div.style.left = "100px";
			div.style.zIndex = 131;
			div.style.display = "none";

			for (let i = 0; i < 4; i++) {
				const chatDiv = div.appendChild(document.createElement("div"));
				chatDiv.classList.add("chat-selection");
				chatDiv.id = `conversation-${i+1}`;
			}
		}


		const div = document.getElementById("conversation");
		div.style.display = actualVisibilty ? "" : "none";

		if (actualVisibilty) {
			let responseIndex = 1;
			for (let i = 0; i < responses.length && responseIndex <= 4; i++) {
				const index = responseIndex;
				const div = document.getElementById(`conversation-${index}`);
				const { response, condition } = responses[i] || {};
				if (!response || condition && !condition(responses[i])) {
					div.style.display = "none";
				} else {
					div.style.display = "";
					div.textContent = typeof(response) === "function" ? response(response[i]) : response;
					responseIndex++;
				}
			}
			for (;responseIndex <= 4; responseIndex++) {
				const div = document.getElementById(`conversation-${responseIndex}`);
				div.style.display = "none";
			}
		}
	}

	updateInventory(selection) {
		const div = document.getElementById("inventory");
		div.innerText = "";
		div.style.flexDirection = "row";
		this.setSelection(null);
		this.inventory.forEach(item => {
			const k = div.appendChild(document.createElement("div"));
			k.classList.add("inventory-item");
			const itemDetails = this.inventoryDetails[item];
			const name = typeof(itemDetails.name) === "function" ? itemDetails.name(itemDetails) : itemDetails.name;
			k.innerText = this.inventoryIcons[item] + " " + name;
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
				this.setSelection(item);
				k.classList.add("selected");
				const itemDetails = this.inventoryDetails[item];
				this.selectTarget(itemDetails);
				this.showActions(itemDetails);
			} else if (selection) {
				k.classList.add("deemphasized");
			}
		});
	}

	updateSpeechForSprites(time, dt) {
		for (let i = engine.spriteCollection.size() - 1; i >= 0; i--) {
			const sprite = engine.spriteCollection.get(i);
			if (sprite.speaker) {
				this.updateSpeech(time, dt, sprite);
			}
		}		
	}

	refresh(time, dt) {
		super.refresh(time, dt);
		if (!this.lastMove || time - this.lastMove > 16) {
			this.applyMovement(this.monkor, this.mouse, dt, time);
			this.checkCollisions(time);
			this.updateSpeechForSprites(time, dt);
			this.updatePiano(time, dt);
			this.updateMouse(time);
			this.updateFile(time);
		}
		this.handleFrames(time);
	}

	selectDialog(id) {
		for (let i = 1; i <= 4; i++) {
			const div = document.getElementById(`conversation-${i}`);
			if (div.id !== id) {
				div.classList.remove("selected");
			} else {
				div.classList.add("selected");
				this.showBubble(div.textContent, () => {
					this.continueDialog(parseInt(div.id.split("conversation-")[1]));
				}, null, null, () => {
					this.setDialogVisibility(false);
				});
			}
			if (id === null || div.id === id) {
				div.classList.remove("disabled");
			} else {
				div.classList.add("disabled");
			}
		}
	}

	getResponse(index) {
		let dialogIndex = 0;

		for (let i = 0; this.dialogResponses.length; i++ ) {
			const { response, condition } = this.dialogResponses[i] || {};
			if (!response || condition && !condition(this.dialogResponses[i])) {
				continue;
			}
			if (dialogIndex === index) {
				return this.dialogResponses[i];
			}
			dialogIndex++;
		}		
		return null;
	}

	getDialogIndexFromTopic(passedTopic) {
		for (let i = 0; i < (this?.dialog?.length || 0); i++) {
			const dialogItem = this.dialog[i];
			if (dialogItem.topic === passedTopic) {
				return i;
			}
		}
		return 0;
	}

	continueDialog(selection, next) {
		const response = selection ? this.getResponse(selection - 1) : null;
		let nextDialogIndex = this.dialogIndex + 1;
		if (response) {
			response.discussed = true;
		}
		if (response && response.onSelect) {
			response.onSelect(response);
		}

		if (response && response.topic) {
			this.dialog.forEach(({topic, message}, index) => {
				if (topic === response.topic) {
					nextDialogIndex = index;
				}
			});
		} else if (response && typeof(response.next) !== "undefined") {
			nextDialogIndex = response.next;
		} else if (typeof(next) !== "undefined") {
			nextDialogIndex = next;
		}
		setTimeout(() => {
			this.startDialog(this.dialogSubject, this.dialog, nextDialogIndex);
		}, 1000);
	}

	applyDialogResponses(responses) {
		if (responses) {
			this.setDialogVisibility(true, responses);
			this.selectDialog(null);
		} else {
			this.setDialogVisibility(false);
			this.selectDialog(null);
		}
	}

	allowExtraHints() {
		return localStorage.getItem("extra_hints");
	}

	startDialog(subject, dialog, index) {
		if (typeof(index) === "string") {
			index = this.getDialogIndexFromTopic(index);
		} else if (typeof(index) === "function") {
			index = index(this.previousIndex);
		}
		index = index || 0;
		const chitChat = dialog ? dialog[index] : null;
		if (!chitChat) {
			this.setControlVisibility(true);
			this.setInventoryVisibility(true);
			this.setDialogVisibility(false);
			this.selectDialog(null);
			this.dialog = null;
			return;
		}
		this.showSubject("");
		const speaker = (chitChat.speaker || subject);
		this.dialogSubject = subject;
		this.dialog = dialog;
		this.previousIndex = this.dialogIndex;
		this.dialogIndex = index;
		this.dialogResponses = chitChat.responses;

		this.setControlVisibility(false);
		this.setInventoryVisibility(false);
		this.setDialogVisibility(false);
		this.selectDialog(null);
		if (chitChat.onStart) {
			chitChat.onStart(subject);
		}
		if (chitChat.lookup) {
			this.monkor.lookupUntil = this.engine.lastTime + chitChat.lookup;			
		}

		if (chitChat.message) {
			this.showBubble(chitChat.message, () => {			
				this.applyDialogResponses(this.dialogResponses);
				this.setInventoryVisibility(true);
				if (chitChat.onEnd) {
					chitChat.onEnd(subject);
				}
				if (!this.dialogResponses && !chitChat.exit) {
					this.continueDialog(null, chitChat.next);
				} else if (chitChat.exit) {
					this.startDialog(null, null, null);
				}
			}, chitChat.voiceName, speaker, null, chitChat.secondsAfterEnd);
		} else {
			this.setInventoryVisibility(true);
			this.applyDialogResponses(this.dialogResponses);
		}
	}

	getDefaultWindowSize(viewportWidth, viewportHeight) {
		return [viewportWidth + 200, viewportHeight + 200];
	}

	getMargin() {
		return { top: 50 };
	}

	handleFrames(time) {
		const sprites = this.onFrameSprites;
		for (let i = 0; i < sprites.length; i++) {
			const sprite = sprites[i];
			const frame = sprite.getAnimationFrame(time);
			const previousFrame = sprite.frame;
			sprite.frame = frame;
			this.handleOnFrame(sprite, frame, previousFrame);
		}
	}

	handleOnFrame(sprite, frame, previousFrame) {
		let f = sprite.onFrame[frame];
		if (typeof f === "number") {
			f = sprite.onFrame[f];
		}
		if (f) {
			f(sprite, previousFrame);
		}
	}

	achieve(achievement, nameOverride) {
		getMedal(achievement, this.onUnlockMedal);
		const gameName = nameOverride || this.constructor.name;
		const level = this.core.sidebar.getLevelFor(gameName);
		console.log("Passed:", level, achievement);
		this.engine.postScore(level, score => this.core.onPostScore(score));
	}

	onUnlockMedal(medal) {
		showUnlockedMedal(medal);
	}
}