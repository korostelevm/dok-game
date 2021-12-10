class Home extends GameBase {
	async init(engine, gameName) {
		super.init(engine, gameName);

		const { gl, config } = engine;
		this.atlas = {
			backwall: await engine.addTexture({
				url: "assets/backwall.jpg",
			}),
			debugBlock: await engine.addTexture({
				url: "assets/debug-block.png",
				collision_url: "assets/debug-block.png",
				spriteWidth: 32, spriteHeight: 32,
				range:[0],
			}),
			debugBlockHighlight: await engine.addTexture({
				url: "assets/debug-block.png",
				collision_url: "assets/debug-block.png",
				spriteWidth: 32, spriteHeight: 32,
				range:[1],
			}),
			debugCrate: await engine.addTexture({
				url: "assets/debug-block.png",
				collision_url: "assets/debug-block.png",
				spriteWidth: 32, spriteHeight: 32,
				range:[2],
			}),
			debugLadder: await engine.addTexture({
				url: "assets/debug-block.png",
				collision_url: "assets/debug-block.png",
				spriteWidth: 32, spriteHeight: 32,
				range:[3],
			}),
			debugMovingPlatform: await engine.addTexture({
				url: "assets/debug-block.png",
				collision_url: "assets/debug-block.png",
				spriteWidth: 32, spriteHeight: 32,
				range:[4],
			}),
			debugCeiling: await engine.addTexture({
				url: "assets/debug-block.png",
				collision_url: "assets/debug-block.png",
				spriteWidth: 32, spriteHeight: 32,
				range:[5],
			}),
			debugPlayer: await engine.addTexture({
				url: "assets/debug-player.png",
				collision_url: "assets/debug-player.png",
			}),
			debugCoin: await engine.addTexture({
				url: "assets/debug-coin.png",
				collision_url: "assets/debug-coin.png",
				spriteWidth: 32, spriteHeight: 32,
				range: [0,3],
				frameRate: 10,
			}),
			debugDoorBack: await engine.addTexture({
				url: "assets/door.png",
				collision_url: "assets/door.png",
				spriteWidth: 64, spriteHeight: 128,
				range: [0],
				frameRate: 10,
			}),
			debugDoor: await engine.addTexture({
				url: "assets/door.png",
				collision_url: "assets/door.png",
				spriteWidth: 64, spriteHeight: 128,
				range: [1,4],
				frameRate: 10,
			}),
			npc: {
				still: await engine.addTexture({
					url: "assets/debug-npc.png",
					collision_url: "assets/debug-npc.png",
					spriteWidth: 32, spriteHeight: 32,
					range:[0, 3],
				}),
				talk: await engine.addTexture({
					url: "assets/debug-npc.png",
					collision_url: "assets/debug-npc.png",
					spriteWidth: 32, spriteHeight: 32,
					range:[4, 7],
				}),
			},
			hero: {
				still: await engine.addTexture({
					url: "assets/stick.png",
					collision_url: "assets/stick-collision.png",
					spriteWidth: 128, spriteHeight: 172,
					frameRate: 10,
					range:[0,3],
				}),
				run: await engine.addTexture({
					url: "assets/stick.png",
					collision_url: "assets/stick-collision.png",
					spriteWidth: 128, spriteHeight: 172,
					frameRate: 10,
					range:[4,7],
				}),
				jump: await engine.addTexture({
					url: "assets/stick.png",
					collision_url: "assets/stick-collision.png",
					spriteWidth: 128, spriteHeight: 172,
					frameRate: 5,
					range:[8,11],
				}),
				climb: await engine.addTexture({
					url: "assets/stick.png",
					collision_url: "assets/stick-collision.png",
					spriteWidth: 128, spriteHeight: 172,
					frameRate: 8,
					range:[20,23],
				}),
				climb_still: await engine.addTexture({
					url: "assets/stick.png",
					collision_url: "assets/stick-collision.png",
					spriteWidth: 128, spriteHeight: 172,
					frameRate: 8,
					range:[24,27],
				}),
				dead: await engine.addTexture({
					url: "assets/stick.png",
					collision_url: "assets/stick-collision.png",
					spriteWidth: 128, spriteHeight: 172,
					frameRate: 10,
					range:[16,19],
				}),
				crouch_still: await engine.addTexture({
					url: "assets/stick.png",
					collision_url: "assets/stick-collision.png",
					spriteWidth: 128, spriteHeight: 172,
					frameRate: 8,
					range:[28,31],
				}),
				crouch: await engine.addTexture({
					url: "assets/stick.png",
					collision_url: "assets/stick-collision.png",
					spriteWidth: 128, spriteHeight: 172,
					frameRate: 8,
					range:[32,35],
				}),
			},
		};

		this.cameras = {
			normal: {
				default: true,
				xOffset: 800, yOffset: 200, zoom: 1,
				maxX: 0, minY: 0,
				follow: "hero",
			},
			zoom: {
				xOffset: 400, yOffset: 200, zoom: 2,
				follow: "hero",
			},
		};

		for (let id in this.cameras) {
			if (this.cameras[id].default || !this.camera) {
				this.camera = id;
			}
		}

		this.audio = {
			... this.audio,
			scream: new Sound("audio/scream.mp3", 1),
			piano: new Sound("audio/piano.mp3", 1),
			beep: new Sound("audio/beep.mp3", .5,),
			eat: new Sound("audio/eat.mp3", .5),
			dud: new Sound("audio/dud.mp3", 1),
			hit: new Sound("audio/hit.mp3", .5),
			door: new Sound("audio/door.mp3", .5),
			pickup: new Sound("audio/pickup.mp3", .3),
			drink: new Sound("audio/drink.mp3", 1),
			mouse: new Sound("audio/animal-cry.mp3", 1),
			jingle: new Sound("audio/jingle.mp3", 1),
		};

		const jump = this.addPhysics(new Jump());
		const control = this.addPhysics(new Control());
		const gravity = this.addPhysics(new Gravity());
		const movement = this.addPhysics(new Movement());
		const collision = this.addPhysics(new Collision());

		const spriteMapper = new SpriteMapper(this, this.spriteFactory, this.atlas, control, this.audio, jump);
		await spriteMapper.init(engine);

		const grid = new SpriteGrid(this, this.spriteFactory, spriteMapper);
		await grid.init();


		const [viewportWidth, viewportHeight] = config.viewport.size;

		this.backwall = this.spriteFactory.create({
			anim: this.atlas.backwall,
			size: [viewportWidth, viewportHeight],
			opacity: .5,
		});

		const gridMap = grid.generate(` 
				..                        [][][][][][][][][][][][][][][][][][][][][][][][]  [][][][]    [][][][]    [][][][]    [][][][]
				..                      HH
				..                      HH
				..                      HH
				..            ?0        HH
				[][]    [][][][][][][][][][][][][]  [][][][]    [][][][][][][][][][][][][]  [][][][]    [][][][][][]VV[][][]  [][]  [][]
				[]    [][]                [][][][]  [][][][]    [][][][][][][][][][][][][]HH[][][][]    [][][][]      [][][]  [][]  [][][][][][][]
				[]    []      8                       [][][]    [][][][][]  [][][][][][][]HH[][][][]    [][][][]  [][][][][]  [][]  [][]          [][]
				[]  $$[]                        [][]  [][]      [][][][][]  [][][][][][][]HH[][][][]    [][][][]  ^^^^^^^^^^  [][]  [][]                    [][][][]
				[]    [][]    []      [][][][]    []  ..              [][]  [][][][][][][]HH[][][][]    [][][][][][][][][][][][][]  [][]                []
				[]  [][]                ?1[][]    [][][][][]      []    []  []          []HH[][][][]    [][][][][][][][][][][][][]  [][]        -4    -3    -2
				[]        [][]    [][][][]      [][][][][][] [] [][][]  []      VVVVVV          [][]                    [][]                                  
				[][]    [][][][]        [][][][][][][][][][]    [][]        VVVVVV  [][][][]          [][][][][][][]          [][]        -0
				....    [][][][][][][]            [][][][][]    [][][]  [][][][][][][][][]  [][][][]    [][][][][][][][][][][][][]    []            -1
				[][][][][][][][][][][][][][][][][][][][][][]    [][][][][][][][][][][][][]  [][][][][]  [][][][][][][][][][][][][]  [][]                         
			`);

		this.refreshableSprites = [];
		gridMap.forEach((line, row) => {
			line.forEach((cell, col) => {
				if (cell && cell.onRefresh) {
					this.refreshableSprites.push(cell);
				}
			});
		})
	}

	applyCamera(camera) {
		const cameraConfig = this.cameras[camera];
		const followed = this[cameraConfig.follow];
		const zoom = cameraConfig.zoom;
		const shift = this.engine.shift;
		shift.goal.x = -followed.x * 2 / zoom + cameraConfig.xOffset;
		shift.goal.y = -followed.y * 2 / zoom + cameraConfig.yOffset;
		shift.goal.zoom = zoom;
		if (typeof(cameraConfig.minX) !== "undefined") {
			shift.goal.x = Math.max(cameraConfig.minX, shift.goal.x);
		}
		if (typeof(cameraConfig.minY) !== "undefined") {
			shift.goal.y = Math.max(cameraConfig.minY, shift.goal.y);			
		}
		if (typeof(cameraConfig.maxX) !== "undefined") {
			shift.goal.x = Math.min(cameraConfig.maxX, shift.goal.x);
		}
		if (typeof(cameraConfig.maxY) !== "undefined") {
			shift.goal.y = Math.max(cameraConfig.maxY, shift.goal.y);			
		}
		this.adjustBackwall();
	}

	onChange(key, value) {
	}

	async postInit() {
		await super.postInit();

		this.adjustBackwall();
	}

	onExit(engine) {

	}

	handleMouse(e) {
	}

	onDropOnOverlay(e) {
	}

	getWindowSize() {
		return [900, 500];
	}

	adjustBackwall() {
		this.backwall.changePosition(-this.engine.shift.x/2 * this.engine.shift.zoom, -this.engine.shift.y/2 * this.engine.shift.zoom);
	}

	refresh(time, dt) {
		super.refresh(time, dt);
		for (let i = 0; i < this.refreshableSprites.length; i++) {
			const sprite = this.refreshableSprites[i];
			sprite.onRefresh(sprite);
		}
		this.applyCamera(this.camera);
	}
}