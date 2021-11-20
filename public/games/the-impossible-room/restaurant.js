class Restaurant extends GameCore {
	async init(engine, gameName) {
		await super.init(engine, gameName);

		const { gl, config } = engine;
		const { gender } = this.data;

		const sir = gender === "T" ? "sirs" : gender === "W" ? "madam" : "sir";
		const Sir = gender === "T" ? "Sirs" : gender === "W" ? "Madam" : "Sir";
		const Messire = gender === "T" ? "Messires" : gender === "W" ? "Madame" : "Messire";
		const messire = gender === "T" ? "messires" : gender === "W" ? "madame" : "messire";
		const me = gender === "T" ? "us" : "me";
		const my = gender === "T" ? "our" : "my";
		const I = gender === "T" ? "We" : "I";
		const Iam = gender === "T" ? "We are" : "I am";

		/* Load Audio */
		this.audio = {
			...this.audio,
		};

		this.atlas = {
			...this.atlas,
			plants: await engine.addTexture(
				{
					url: "assets/lobby.png",
					texture_url: "assets/skin-texture.jpg",
					texture_alpha: .20,
					texture_blend: "source-atop",
					cols:4,rows:7,
					range:[22],
				}),
			curtains: await engine.addTexture({
					url: "assets/restaurant.png",
					texture_url: "assets/skin-texture.jpg",
					texture_alpha: .20,
					texture_blend: "source-atop",
					cols:2,rows:3,
					range:[0,2],
					frameRate: 8,
			}),
			table: await engine.addTexture({
					url: "assets/restaurant.png",
					collision_url: "assets/restaurant.png",
					texture_url: "assets/skin-texture.jpg",
					texture_alpha: .20,
					texture_blend: "source-atop",
					cols:2,rows:3,
					range:[3],
			}),
			table_broke: await engine.addTexture({
					url: "assets/restaurant.png",
					texture_url: "assets/skin-texture.jpg",
					texture_alpha: .20,
					texture_blend: "source-atop",
					cols:2,rows:3,
					range:[4],
			}),
			table_completely_broke: await engine.addTexture({
					url: "assets/restaurant.png",
					texture_url: "assets/skin-texture.jpg",
					texture_alpha: .20,
					texture_blend: "source-atop",
					cols:2,rows:3,
					range:[5],
			}),
			chef_left: await engine.addTexture({
					url: "assets/chef.png",
					collision_url: "assets/chef.png",
					cols:4,rows:4,
					range:[1],
			}),
			chef_right: await engine.addTexture({
					url: "assets/chef.png",
					collision_url: "assets/chef.png",
					cols:4,rows:4,
					range:[1],
					direction: -1,
			}),
			chef_walk_left: await engine.addTexture({
					url: "assets/chef.png",
					collision_url: "assets/chef.png",
					cols:4,rows:4,
					range:[0,3],
					frameRate: 10,
			}),
			chef_walk_right: await engine.addTexture({
					url: "assets/chef.png",
					cols:4,rows:4,
					range:[0,3],
					direction: -1,
					frameRate: 10,
			}),
			chef_talk_left: await engine.addTexture({
					url: "assets/chef.png",
					collision_url: "assets/chef.png",
					cols:4,rows:4,
					range:[3,4],
					frameRate: 10,
			}),
			chef_talk_right: await engine.addTexture({
					url: "assets/chef.png",
					cols:4,rows:4,
					range:[3,4],
					direction: -1,
					frameRate: 10,
			}),
			chef_serve_left: await engine.addTexture({
					url: "assets/chef.png",
					collision_url: "assets/chef.png",
					cols:4,rows:4,
					range:[6],
			}),
			chef_serve_right: await engine.addTexture({
					url: "assets/chef.png",
					collision_url: "assets/chef.png",
					cols:4,rows:4,
					range:[6],
					direction: -1
			}),
			chef_serve_walk_left: await engine.addTexture({
					url: "assets/chef.png",
					collision_url: "assets/chef.png",
					cols:4,rows:4,
					range:[6,9],
					frameRate: 10,
			}),
			chef_serve_walk_right: await engine.addTexture({
					url: "assets/chef.png",
					cols:4,rows:4,
					range:[6,9],
					direction: -1,
					frameRate: 10,
			}),
			chef_serve_talk_left: await engine.addTexture({
					url: "assets/chef.png",
					collision_url: "assets/chef.png",
					cols:4,rows:4,
					range:[5,6],
					frameRate: 10,
			}),
			chef_serve_talk_right: await engine.addTexture({
					url: "assets/chef.png",
					cols:4,rows:4,
					range:[5,6],
					direction: -1,
					frameRate: 10,
			}),
			chef_surprised_left: await engine.addTexture({
					url: "assets/chef.png",
					collision_url: "assets/chef.png",
					cols:4,rows:4,
					range:[10],
			}),
			chef_surprised_right: await engine.addTexture({
					url: "assets/chef.png",
					collision_url: "assets/chef.png",
					cols:4,rows:4,
					range:[10],
					direction: -1
			}),			
			chef_surprised_talk_left: await engine.addTexture({
					url: "assets/chef.png",
					collision_url: "assets/chef.png",
					cols:4,rows:4,
					range:[10,11],
					frameRate: 12,
			}),
			chef_surprised_talk_right: await engine.addTexture({
					url: "assets/chef.png",
					collision_url: "assets/chef.png",
					cols:4,rows:4,
					range:[10,11],
					direction: -1,
					frameRate: 12,
			}),			
			chef_faint_left: await engine.addTexture({
					url: "assets/chef.png",
					collision_url: "assets/chef.png",
					cols:4,rows:4,
					range:[12],
			}),
			chef_faint_right: await engine.addTexture({
					url: "assets/chef.png",
					collision_url: "assets/chef.png",
					cols:4,rows:4,
					range:[12],
					direction: -1,
			}),			
			burger_left: await engine.addTexture({
					url: "assets/burger.png",
					collision_url: "assets/burger.png",
					direction: -1,
			}),
			burger_right: await engine.addTexture({
					url: "assets/burger.png",
					collision_url: "assets/burger.png",
			}),
		};

		this.backwall = this.spriteFactory.create({
			anim: this.atlas.backwall,
			size: [800, 400],
		});

		this.spriteFactory.create({
			anim: this.atlas.plants,
			size: [800, 400],
		});

		this.spriteFactory.create({
			anim: this.atlas.side_doors,
			size: [800, 400],
		});
		this.doorBack = this.spriteFactory.create({
			name: "Exit",
			anim: this.atlas.left_door,
			size: [800, 400],
		}, {
		});

		this.doorForwardOpened = this.spriteFactory.create({
			name: "Next Room",
			anim: this.atlas.right_door_opened,
			size: [800, 400],
			opacity: 0,			
		}, {
			actions: [
				{ name: "walk through", condition: () => this.burger.properties.eaten || this.monkor.properties.joker === this.constructor.name,
					action: forward_door => {
						this.walkThrough();
					},
				},
				{ name: "walk through", condition: () => !this.burger.properties.eaten && !this.monkor.properties.joker === this.constructor.name,
					message: `${Iam} in no hurry. Let's check out the menu first before tackling the next room.`,
				},
			],
		});

		this.table = this.spriteFactory.create({
			name: "Table",
			anim: this.atlas.table,
			y: -40,
			size: [800, 400],
			opacity: 1,			
		}, {
			actions: [
				{ name: "look", message: "The table is set.",
				},
			],
		});

		this.burger = this.spriteFactory.create({
			name: "Impossible Burger",
			anim: this.atlas.burger_left,
			x: 380,
			y: 350,
			hotspot: [150, 250],
			size: [300, 250],
			opacity: 0,
		}, {
			onChange: {
				served: (burger, served) => {
					burger.changeOpacity(served ? 1 : 0, this.engine.lastTime);
					if (served && !burger.eaten) {
						this.table.changeOpacity(1, this.engine.lastTime);
						this.table.changeAnimation(this.atlas.table_broke, this.engine.lastTime);
						burger.changePosition(burger.x, 280, this.engine.lastTime);
						setTimeout(() => {
							this.haveMouseCheckBurger();
							burger.changePosition(burger.x, 350, this.engine.lastTime);
							this.table.changeAnimation(this.atlas.table_completely_broke, this.engine.lastTime);
							if (this.audio && this.audio.hit) {
								this.audio.hit.play();
							}
							const shakeTime = this.engine.lastTime;
							this.engine.shake = time => {
								const progress = 50 * (time - shakeTime) / 5000;
								return progress >= 1 ? null : 50 / progress;
							};
						}, 50);
					}
				},
				eaten: (burger, eaten) => {
					if (eaten) {
						burger.changeOpacity(0, this.engine.lastTime);
					}
				},
			},
			actions: [
				{
					name: "look",
					message: `This burger is ginormous! How will ${I} ever finish it?`,
				},
				{
					name: "eat",
					message: `${I} don't even know where to begin.`,
				},
			],
		});

		this.butler = this.spriteFactory.create({
			name: "Nicolas",
			anim: this.atlas.butler,
			x: 150, y: 340,
			size: [96,192],
			hotspot: [24,192],
		}, {
			actions: [
				{ name: "talk",
					action: butler => {
						this.monkor.goal.x = this.butler.x < this.monkor.x ? this.butler.x - 20 : this.butler.x + 20;
						this.startDialog(butler, [
							{
								message: `Yes, ${messire}?`,
								voiceName: "Thomas",
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => butler.talking = 0,
							},
							{
								responses: [
									{
										response: "Is this the impossible room?",
										topic: "impossible",
									},
									{
										response: `Can you give ${me} a hint?`,
										topic: "hint",
										condition: () => !this.burger.properties.served && !this.burger.properties.eaten,
									},
									{
										response: `Can you give ${me} a hint?`,
										topic: "hint2",
										condition: () => this.burger.properties.served && !this.burger.properties.eaten,
									},
									{
										response: `You can have a piece of the impossible burger if you want.`,
										topic: "burger",
										condition: () => this.burger.properties.served && !this.burger.properties.eaten,
									},
									{
										response: `Do you think this impossible burger is really vegan?`,
										topic: "vegan",
										condition: () => this.burger.properties.served && !this.burger.properties.eaten,
									},
									{
										response: `${I}'ll be on ${my} way`,
									},
								],
							},
							{
								message: `Au revoir, ${messire}.`,
								voiceName: "Thomas",
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => butler.talking = 0,
								exit: true,
							},
							{
								topic: "hint",
								message: `Let's have a bite to eat first, ${messire}.`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => butler.talking = 0,
								exit: true,
							},
							{
								topic: "hint2",
								message: `You ordered that burger, ${messire}. Now who's going to eat it?`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => butler.talking = 0,
							},
							{
								message: `Perhaps you need to drag someone in to help.`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => butler.talking = 0,
								exit: true,
							},
							{
								topic: "vegan",
								message: `I do not care, ${messire}. I am not touching that burger!`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => butler.talking = 0,
								exit: true,
							},
							{
								topic: "burger",
								message: "No, thank you.",
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => butler.talking = 0,
							},
							{
								message: "I got full just by looking at it.",
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => butler.talking = engine.lastTime,
								onEnd: butler => butler.talking = 0,
								exit: true,
							},
							{
								topic: "impossible",
								message: `No ${messire}, this is not yet the impossible room.`,
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => {
									butler.talking = engine.lastTime;
								},
								onEnd: butler => {
									butler.talking = 0;
								},
							},
							{
								message: "This is the impossible restaurant.",
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => {
									butler.talking = engine.lastTime;
								},
								onEnd: butler => {
									butler.talking = 0;
								},
							},
							{
								message: () => {
									if (!this.burger.properties.served) {
										return `Feel free to order a bite to eat before going further, ${messire}.`;
									} else if (this.burger.properties.eaten) {
										return "If you are done, we can continue further.";
									} else {
										return "It's impossible to exit without finishing this giant burger.";
									}
								},
								voiceName: "Thomas",
								secondsAfterEnd: 1,
								onStart: butler => {
									butler.talking = engine.lastTime;
								},
								onEnd: butler => {
									butler.talking = 0;
								},
							},
						]);
					},
				},
			],
		}, butler => {
			butler.goal = {x: butler.x, y: butler.y};
		});
		this.doorForwardClosed = this.spriteFactory.create({
			name: "door",
			anim: this.atlas.right_door,
			size: [800, 400],
		}, {
			actions: [
				{ name: "open", message: `The door is locked.`},			
				{ name: "knock", condition: () => this.chef.x > 800,
					action: door => {
						this.monkor.knock = this.engine.lastTime;
						setTimeout(() => this.audio.hit.play(), 100);
						setTimeout(() => this.audio.hit.play(), 300);
						setTimeout(() => this.audio.hit.play(), 500);

						setTimeout(() => {
							this.monkor.knock = 0;
						}, 1000);

						setTimeout(() => {
							this.chefReturn();
						}, 5000);
					},
				},			
			],
		});

		this.burgerServed = this.spriteFactory.create({
			anim: this.atlas.burger_left,
			x: 600 - 40,
			y: 230,
			hotspot: [150, 250],
			size: [300, 250],
			opacity: 0,
		});

		this.chef = this.spriteFactory.create({
			name: "Chef Berger",
			anim: this.atlas.chef_left,
			x: this.burger.properties.served && !this.burger.properties.eaten ? 850 : 600,
			y: 350,
			hotspot: [150, 250],
			size: [300, 300],
		}, {
			actions: [
				{
					name: "look", condition: () => !this.burger.properties.served,
					message: `The chef seems ready to take ${my} order.`,
					action: chef => {
						this.monkor.goal.x = this.chef.x - 150;
						this.showBubble(chef.pendingMessage, () => {
							setTimeout(() => {
								chef.setProperty("talking", this.engine.lastTime);
								this.showBubble("Yes, I am ready to take your order.", () => {
									chef.setProperty("talking", null);
								}, "Fred", chef);
							}, 1000);
						});
					},
				},
				{
					name: "look", condition: () => this.burger.properties.served && !this.burger.properties.eaten,
					message: `The chef seems very proud about the dish he made.`,
				},
				{
					name: "look", condition: () => this.burger.properties.eaten,
					message: `${I} guess he didn't expect ${me} to finish the burger.`,
				},
				{
					name: "talk", condition: () => !this.burger.properties.served,
					action: chef => {
						const voiceName = "Fred";
						this.monkor.goal.x = this.chef.x - 150;
						this.startDialog(chef, [
							{
								message: `Welcome to the Impossible Restaurant.`,
								voiceName,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
							},
							{
								message: `May I take your order?`,
								voiceName,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
							},
							{
								topic: "questions",
								responses: [
									{
										response: `May ${I} ask? Why is it called the impossible restaurant?`,
										topic: "impossible",
									},
									{
										response: "What's on the menu?",
										topic: "menu",
									},
									{
										condition: () => localStorage.getItem("ordered-burger"),
										response: `${I}'d like to have the impossible burger.`,
										topic: "get_burger",
									},
									{
										response: `How do ${I} exit this room`,
										topic: "exit",
									},
									{
										response: `${I}'ll be on ${my} way`,
									},
								],
							},
							{
								message: `Come back soon!`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
								exit: true,
							},
							{
								topic: "unwanted-item",
								message: `No thanks.`,
								voiceName,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
								next: previousIndex => previousIndex,
							},
							{
								topic: "impossible",
								message: `Certainly, ${sir}.`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
							},
							{
								message: `The meals in my restaurants are impossibly good!`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
							},
							{
								message: `The taste will be impossible for you to resist!`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
							},
							{
								message: `It is so good, no one has ever left without finishing their meal.`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
								next: "questions",
							},
							{
								topic: "exit",
								message: `You're free to leave any time you want.`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
							},
							{
								message: `But I'm sure you'll want to check out our menu first!`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
							},
							{
								message: `${I} sure do!`,
								speaker: this.monkor,
							},
							{
								message: `We have the most exquisite dishes from countries around the world.`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
								next: "questions",
							},
							{
								topic: "menu",
								message: `I'm sure you will be delighted.`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
							},
							{
								message: `Our first item on the menu, is a caprese salad,`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
							},
							{
								message: `With organic tomatoe, freshly cut mozarella and home grown basil, and a hint of truffle oil.`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
							},
							{
								message: `That sounds like a real delight!`,
								speaker: this.monkor,
							},
							{
								topic: "choice_1",
								responses: [
									{
										condition: () => localStorage.getItem("ordered-burger"),
										response: `Let's cut to the chase. I want the impossible burger.`,
										topic: "get_burger",
									},
									{
										response: `Ok, ${I}'ll have the caprese salad.`,
										condition: response => !response.discussed,
									},
									{
										response: "What else do you have?",
										topic: "menu_2",
									},
								],
							},
							{
								message: `An excellent choice, ${sir}.`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
							},
							{
								message: `Unfortunately, we are out of freshly cut mozarella.`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
							},
							{
								message: `May I interest you in another item on the menu?`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
								next: "choice_1",
							},
							{
								topic: "menu_2",
								message: `Certainly, ${sir}.`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
							},
							{
								message: `Our second item on the menu, is the ceviche de pescado,`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
							},
							{
								message: `With fleshly caught tilapia, organic tomatoes, avocadoes, and lime.`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
							},
							{
								message: `A light dish and a real delight if you love fish.`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
							},
							{
								message: `My mouth is watering already!`,
								speaker: this.monkor,
							},
							{
								topic: "choice_2",
								responses: [
									{
										condition: () => localStorage.getItem("ordered-burger"),
										response: `Let's cut to the chase. I want the impossible burger.`,
										topic: "get_burger",
									},
									{
										response: `Ok, ${I}'ll have the cerviche de pescado.`,
										condition: response => !response.discussed,
									},
									{
										response: "What else do you have?",
										topic: "menu_3",
									},
								],
							},
							{
								message: `An excellent choice, ${sir}.`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
							},
							{
								message: `Unfortunately, the tilapia is out of season.`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
							},
							{
								message: `May I interest you in another item on the menu?`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
								next: "choice_2",
							},
							{
								topic: "menu_3",
								message: `Certainly, ${sir}.`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
							},
							{
								message: `Our third item on the menu, is the impossible burger,`,
								voiceName,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
							},
							{
								message: `Did you just say the impossible burger?`,
								speaker: this.monkor,
							},
							{
								message: `That's right, we have the impossible burger.`,
								voiceName,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
							},
							{
								message: `${I} want the impossible burger!`,
								speaker: this.monkor,
							},
							{
								message: `Did you ever try the impossible burger?`,
								voiceName: "Thomas",
								speaker: this.butler,
								secondsAfterEnd: 1,
								onStart: chef => {
									this.monkor.lookLeft = true;
									this.butler.talking = this.engine.lastTime;
								},
								onEnd: chef => {
									this.monkor.lookLeft = false;
									this.butler.talking = 0;
								},
							},
							{
								message: `Never, but ${I} always wanted to try the impossible burger. It must be delicious!`,
								speaker: this.monkor,
							},
							{
								message: `And having the impossible burger at the impossible restaurant sounds like the perfect occasion.`,
								speaker: this.monkor,
							},
							{
								message: `Ok, ${sir}. You shall have the impossible burger.`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
							},
							{
								message: `Please allow me some time to prepare your dish, ${sir}.`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => {
									chef.setProperty("talking", null);
									this.getBurger();
								},
								exit: true,
							},
							{
								topic: "get_burger",
								message: `Sure. Please allow me some time to prepare your dish, ${sir}.`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => {
									chef.setProperty("talking", null);
									this.getBurger();
								},								
								exit: true,
							}
						]);
					},
				}
			],
			onChange: {
				serving: (chef, serving) => {
					this.burgerServed.changeOpacity(serving ? 1 : 0, this.engine.lastTime);
				},
			},
		}, chef => {
			chef.goal = {x: chef.x, y: chef.y};
		});

		this.setRightOpened(!this.burger.properties.served || this.burger.properties.eaten);

		this.sceneData.monkor = this.sceneData.monkor || { x: 120, y: 350 };
	}

	haveMouseCheckBurger(check) {
		const mouseDom = document.getElementById("mouse");
		mouseDom.style.transform = "scale(-1, 1)";
	}

	nudgeMouse(time) {
		if (!this.burger.properties.served) {
			return;
		}
		if (!this.nextNudge || time > this.nextNudge) {
			this.nextNudge = time + Math.random() * 30000;
		}
		const mouseDom = document.getElementById("mouse");
		const value = (this.nextNudge - time < 800) ? Math.floor(Math.random() * 5) : 0;
		mouseDom.style.marginTop = `${-value}px`;
		mouseDom.style.marginBottom = `${value}px`;
	}

	chefReturn() {
		const { gender } = this.data;

		const sir = gender === "T" ? "sirs" : gender === "W" ? "madam" : "sir";
		const Sir = gender === "T" ? "Sirs" : gender === "W" ? "Madam" : "Sir";
		const Messire = gender === "T" ? "Messires" : gender === "W" ? "Madame" : "Messire";
		const messire = gender === "T" ? "messires" : gender === "W" ? "madame" : "messire";
		const me = gender === "T" ? "us" : "me";
		const my = gender === "T" ? "our" : "my";
		const I = gender === "T" ? "We" : "I";
		const Iam = gender === "T" ? "We are" : "I am";

		this.monkor.paused = true;
		this.monkor.goal.x = 400;
		this.setRightOpened(true);
		this.chef.goal.x = 600;
		this.chef.onStill = chef => {
			const voiceName = "Fred";
			if (!this.burger.properties.eaten) {
				this.setRightOpened(false);
				this.startDialog(this.chef, [
					{
						message: `${Sir}. How are you enjoying your burger?`,
						voiceName,
						secondsAfterEnd: 2,
						onStart: chef => chef.setProperty("talking", this.engine.lastTime),
						onEnd: chef => {
							chef.setProperty("talking", null);
						},
					},
					{
						topic: "questions",
						responses: [
							{
								response: "It is revolting. Please take it back.",
								topic: "revolting",
								condition: response => !response.discussed,
							},
							{
								response: `${I} can't possibly finish it. Please just let ${me} pass.`,
								topic: "finish",
								condition: response => !response.discussed,
							},
							{
								response: "It is absolutely delightful. My compliments to the chef!",
								topic: "compliments",
								condition: response => !response.discussed,
							},
							{
								response: `Do you happen to have any ketchup?`,
								topic: "ketchup",
								condition: response => !response.discussed,
							},
							{
								response: `${I} guess ${I}'ll be going. ${I} have a burger to finish`,
							},
						],
					},
					{
						message: `Enjoy your meal, ${sir}.`,
						voiceName,
						secondsAfterEnd: 2,
						onStart: chef => chef.setProperty("talking", this.engine.lastTime),
						onEnd: chef => {
							chef.setProperty("talking", null);
							this.chefExit();
						},
						exit: true,
					},
					{
						topic: "unwanted-item",
						message: `No thanks.`,
						voiceName,
						onStart: chef => chef.setProperty("talking", this.engine.lastTime),
						onEnd: chef => chef.setProperty("talking", null),
						next: previousIndex => previousIndex,
					},
					{
						topic: "revolting",
						message: `${Sir}, you have not yet tasted your burger.`,
						voiceName,
						secondsAfterEnd: 2,
						onStart: chef => chef.setProperty("talking", this.engine.lastTime),
						onEnd: chef => chef.setProperty("talking", null),
					},
					{
						message: `I suggest you do so before insulting my dish!`,
						voiceName,
						secondsAfterEnd: 2,
						onStart: chef => chef.setProperty("talking", this.engine.lastTime),
						onEnd: chef => chef.setProperty("talking", null),
						next: "questions",
					},
					{
						topic: "finish",
						message: `${Sir}, you insisted on having the impossible burger. Now you must finish it.`,
						voiceName,
						secondsAfterEnd: 2,
						onStart: chef => chef.setProperty("talking", this.engine.lastTime),
						onEnd: chef => chef.setProperty("talking", null),
						next: "questions",
					},
					{
						topic: "compliments",
						message: `Thank you ${sir}. I was sure you would love it.`,
						voiceName,
						secondsAfterEnd: 1,
						onStart: chef => chef.setProperty("talking", this.engine.lastTime),
						onEnd: chef => chef.setProperty("talking", null),
					},
					{
						message: `Please take time to enjoy every bite, ${sir}.`,
						voiceName,
						secondsAfterEnd: 2,
						onStart: chef => chef.setProperty("talking", this.engine.lastTime),
						onEnd: chef => chef.setProperty("talking", null),
						next: "questions",
					},
					{
						topic: "ketchup",
						message: `${Sir}, I suggest you first try the burger before adding any condiments.`,
						voiceName,
						secondsAfterEnd: 2,
						onStart: chef => chef.setProperty("talking", this.engine.lastTime),
						onEnd: chef => chef.setProperty("talking", null),
						next: "questions",
					},
				]);
			} else {
				this.startDialog(this.chef, [
					{
						message: `${Sir}. How are you enjoying your burger...`,
						voiceName,
						onStart: chef => chef.setProperty("talking", this.engine.lastTime),
						onEnd: chef => {
							chef.setProperty("surprised", true);
							chef.setProperty("talking", null);
						},
					},
					{
						message: `Daahh! you finished it!...`,
						voiceName,
						onStart: chef => chef.setProperty("talking", this.engine.lastTime),
						onEnd: chef => {
							chef.setProperty("talking", null);
						},
					},
					{
						message: `How did you finish my impossible burger!...`,
						voiceName,
						onStart: chef => chef.setProperty("talking", this.engine.lastTime),
						onEnd: chef => {
							chef.setProperty("talking", null);
						},
					},
					{
						message: `It's impossible, I must be dreaming....`,
						voiceName,
						onStart: chef => chef.setProperty("talking", this.engine.lastTime),
						onEnd: chef => {
							chef.setProperty("talking", null);
							chef.setProperty("faint", true);
						},
					},
				]);
			}
		};
	}

	chefExit(callback) {
		this.chef.goal.x = 700;
		this.chef.onStill = chef => {
			this.monkor.setProperty("paused", true);
			this.setRightOpened(true);
			this.chef.goal.x = 850;
			this.chef.onStill = chef => {
				this.setRightOpened(false);
				this.monkor.setProperty("paused", false);
				if (callback) {
					callback(this.chef);
				}
			};
		};		
	}

	getBurger() {
		localStorage.setItem("ordered-burger", true);
		const { gender } = this.data;
		const Sir = gender === "T" ? "Sirs" : gender === "W" ? "Madam" : "Sir";
		const sir = gender === "T" ? "sirs" : gender === "W" ? "madam" : "sir";
		const amI = gender === "T" ? "are we" : "am I";
		this.chefExit(chef => {
			setTimeout(() => {
				this.chef.setProperty("serving", true);
				this.monkor.setProperty("paused", true);
				this.setRightOpened(true);
				this.chef.overrideDx = 1;
				this.chef.goal.x = 600;
				this.chef.onStill = chef => {
					this.setRightOpened(false);
					this.chef.goal.x = 500;
					this.monkor.goal.x = 200;
					this.chef.overrideDx = 0;
					this.chef.onStill = chef => {
						this.monkor.lookRight = true;
						this.monkor.setProperty("paused", false);
						const voiceName = "Fred";
						this.startDialog(this.chef, [
							{
								message: `${Sir}. Here is your impossible burger.`,
								voiceName,
								secondsAfterEnd: 2,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => {
									chef.setProperty("talking", null);
									chef.setProperty("serving", false);
									this.burger.setProperty("served", this.engine.lastTime);
								},
							},
							{
								message: `Needless to say, ${sir}.`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
							},
							{
								message: `You may not leave this room,`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
							},
							{
								message: `until you finish your meal.`,
								voiceName,
								secondsAfterEnd: 2,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => chef.setProperty("talking", null),
							},
							{
								message: `Bon appetit, ${sir}.`,
								voiceName,
								secondsAfterEnd: 1,
								onStart: chef => chef.setProperty("talking", this.engine.lastTime),
								onEnd: chef => {
									chef.setProperty("talking", null);
									this.chef.goal.x = 700;
									this.chef.onStill = chef => {
										this.monkor.setProperty("paused", true);
										this.setRightOpened(true);
										this.chef.goal.x = 850;
										this.chef.onStill = chef => {
											this.setRightOpened(false);
											this.monkor.setProperty("paused", false);
											this.monkor.lookRight = false;
											this.showBubble(`How ${amI} going to finish this burger. It's enormous!`, () => {
												setTimeout(() => {
													this.butler.talking = true;
													this.showBubble("That is why it is called the impossible burger.", () => {
														this.butler.talking = false;
													}, "Thomas", this.butler);
												}, 1000);
											});
										};
									};
								},
							},
						]);

					};
				};
			}, 10000);
		});
	}

	updateChef(time) {
		const goalX = typeof(this.chef.goal.x) == "function" ? this.chef.goal.x(this.chef) : this.chef.goal.x;
		const goalY = typeof(this.chef.goal.y) == "function" ? this.chef.goal.y(this.chef) : this.chef.goal.y;
		const dx = goalX - this.chef.x;
		const dy = goalY - this.chef.y;
		this.chef.dx = dx;
		const dist = Math.sqrt(dx * dx + dy * dy);
		const speed = 2;
		const chefSprite = this.chef.properties.faint ? "chef_faint" : this.chef.properties.surprised ? "chef_surprised" : this.chef.properties.serving ? "chef_serve" : "chef"
		let turnTowardsRight = false;
		if (dist > 5) {
			this.chef.changePosition(this.chef.x + speed * dx / dist, this.chef.y + speed * dy / dist, time);
			if (dx < 0) {
				this.chef.changeAnimation(this.atlas[`${chefSprite}_walk_left`], time);
			} else {
				this.chef.changeAnimation(this.atlas[`${chefSprite}_walk_right`], time);				
				turnTowardsRight = true;
			}
			this.chef.stillTime = 0;
		} else {
			turnTowardsRight = this.chef.overrideDx || this.chef.dx > 0;
			if (this.chef.properties.talking) {
				this.chef.changeAnimation(turnTowardsRight ? this.atlas[`${chefSprite}_talk_right`] : this.atlas[`${chefSprite}_talk_left`], time);
			} else {
				this.chef.changeAnimation(turnTowardsRight ? this.atlas[`${chefSprite}_right`] : this.atlas[`${chefSprite}_left`], time);
			}
			if (!this.chef.stillTime) {
				this.chef.stillTime = time;
			} else if (time - this.chef.stillTime > 500) {
				if (this.chef.onStill) {
					const onStill = this.chef.onStill;
					this.chef.onStill = null;
					onStill(this.chef, time);
				}
			}
		}
		if (this.chef.properties.serving) {
			this.burgerServed.changePosition(this.chef.x + (turnTowardsRight ? 60 : -60), this.burgerServed.y, time);
			this.burgerServed.changeAnimation(turnTowardsRight ? this.atlas.burger_right : this.atlas.burger_left, time);
		}
	}

	updateHost(time) {
		const goalX = typeof(this.butler.goal.x) == "function" ? this.butler.goal.x(this.butler) : this.butler.goal.x;
		const goalY = typeof(this.butler.goal.y) == "function" ? this.butler.goal.y(this.butler) : this.butler.goal.y;
		const dx = goalX - this.butler.x;
		const dy = goalY - this.butler.y;
		const dist = Math.sqrt(dx * dx + dy * dy);
		if (dist > 5) {
			this.butler.changePosition(this.butler.x + dx / dist, this.butler.y + dy / dist, time);
			if (dx < 0) {
				this.butler.changeAnimation(this.atlas.butler_walk_left, time);
			} else {
				this.butler.changeAnimation(this.atlas.butler_walk_right, time);				
			}
			this.butler.stillTime = 0;
		} else {
			if (this.butler.shakingHands) {
				if (!this.butler.talking) {
					this.butler.changeAnimation(this.monkor.x < this.butler.x ? this.atlas.butler_shake_hands_left : this.atlas.butler_shake_hands_right, this.butler.shakingHands || time);
				} else {
					this.butler.changeAnimation(this.monkor.x < this.butler.x ? this.atlas.butler_shake_hands_talk_left : this.atlas.butler_shake_hands_talk_right, this.butler.shakingHands || time);					
				}
			} else {
				const dxToMonkor = this.butler.x - this.monkor.x;
				const dyToMonkor = this.butler.y - this.monkor.y;
				const distToMonkor = Math.sqrt(dxToMonkor * dxToMonkor + dyToMonkor * dyToMonkor);
				if (this.butler.talking) {
					this.butler.changeAnimation(this.monkor.x < this.butler.x ? this.atlas.butler_talk_left : this.atlas.butler_talk_right, time);
				} else if (this.dialog) {
					this.butler.changeAnimation(this.monkor.x < this.butler.x ? this.atlas.butler_still_left : this.atlas.butler_still_right, time);
				} else {
					this.butler.changeAnimation(this.atlas.butler, time);					
				}
			}
			if (!this.butler.stillTime) {
				this.butler.stillTime = time;
			} else if (time - this.butler.stillTime > 2000) {
				if (this.butler.onStill) {
					const onStill = this.butler.onStill;
					this.butler.onStill = null;
					onStill(this.butler, time);
				}
			}
		}
	}

	restoreMouse(mouse) {
		super.restoreMouse(mouse);
		if (this.burger.properties.eaten) {
			return;
		}
		this.burger.setProperty("eaten", true);
		const { gender } = this.data;
		const Messire = gender === "T" ? "Messires" : gender === "W" ? "Madame" : "Messire";
		const messire = gender === "T" ? "messires" : gender === "W" ? "madame" : "messire";
		const me = gender === "T" ? "us" : "me";
		const my = gender === "T" ? "our" : "my";
		const I = gender === "T" ? "We" : "I";
		const Iam = gender === "T" ? "We are" : "I am";
		this.butler.talking = true;
		this.monkor.paused = true;
		this.monkor.goal.x = 200;
		this.showBubble(`${Messire}, what is it with you and mice?`, () => {
			this.butler.talking = false;
			setTimeout(() => {
				this.showBubble(`${I} have always been scared of mice, since ${Iam} young.`, () => {
					setTimeout(() => {
						this.butler.talking = true;
						this.monkor.lookRight = true;
						this.showBubble(`Well, the mouse just saved us by eating the impossible burger, ${messire}.`, () => {
							this.butler.talking = false;
							setTimeout(() => {
								this.showBubble(`That's incredible!`, () => {
									setTimeout(() => {
										this.monkor.lookRight = false;
										this.showBubble(`${I} guess the chef will let us leave the restaurant then.`, () => {
											this.monkor.paused = false;
										});
									}, 1000);
								});
							}, 3000);
						}, "Thomas", this.butler);
					}, 1000);
				});
			}, 2000);

		}, "Thomas", this.butler);
	}

	canUseJoker() {
		return this.burger.properties.served;
	}

	onPutBack(mouse) {
		if (this.burger.properties.served && !this.burger.properties.eaten) {
			if (!this.mouse.eating) {
				this.mouse.eating = true;
				this.monkor.paused = true;
				const mouseOnStill = () => {
					if (!this.mouse.onStill) {
						this.audio.hit.play();

						this.mouse.goal.y = this.burger.y-5;
						if (this.mouse.x > this.burger.x) {
							this.mouse.goal.x = this.burger.x - 100;
						} else {
							this.mouse.goal.x = this.burger.x + 100;
						}
						this.burger.eatProgress = (this.burger.eatProgress||0)  + .05;
						if (this.burger.eatProgress >= 1) {
							mouse.eating = false;
							super.onPutBack(mouse, 3000);
							return;
						}
						this.mouse.onStill = mouseOnStill;
					}
				};
				this.mouse.onStill = mouseOnStill;
			}
		} else {
			super.onPutBack(mouse);
		}
		// mouse.putBack = 0;
		// mouse.alive = 0;
		// this.monkor.scared = 0;

		// this.restoreMouse(mouse);
	}

	updateBurger(time) {
		if (this.burger.eatProgress && this.burger.eatProgress !== this.burger.eatProgressViz) {
			this.burger.eatProgressViz = this.burger.eatProgress;
			const eatProgress = this.burger.eatProgress;
			if (eatProgress >= 1) {
				this.burger.changeOpacity(0, time);
			} else {
				this.burger.changeOpacity(1, time);
				const cropProgress = (1 - eatProgress);
				this.burger.changeCrop(1, Math.max(0, cropProgress), time);
				this.burger.changeHotSpot(this.burger.hotspot[0], cropProgress * 250, time);
			}
		}
	}

	addMonkor() {
		super.addMonkor();
		this.spriteFactory.create({
			anim: this.atlas.backwallforeground,
			size: [800, 400],
		});
		this.spriteFactory.create({
			anim: this.atlas.curtains,
			size: [800, 400],
		});
	}

	getWalkArea() {
		return this.backwall.getCollisionBox(engine.lastTime);		
	}

	refresh(time, dt) {
		super.refresh(time, dt);
		this.updateHost(time);
		this.updateChef(time);
		this.updateBurger(time);
		this.nudgeMouse(time);
	}	

	setRightOpened(opened) {
		this.doorForwardOpened.changeOpacity(opened?1:0, engine.lastTime);										
		this.doorForwardClosed.changeOpacity(opened?0:1, engine.lastTime);
		if (this.doorNextLock) {
			this.doorNextLock.changeOpacity(opened?0:1, engine.lastTime);
		}		
		if (opened) {
			this.audio.door.play();
		} else {
			this.audio.hit.play();
		}
	}

	isRoomSolved() {
		return this.burger.properties.eaten;
	}

	nextLevelLeft() {
	}

	nextLevelRight() {
		this.engine.setGame(new ClueRoom());
	}
}