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
				cols:2,rows:2,
				range:[0],
			}),
			debugCrate: await engine.addTexture({
				url: "assets/debug-block.png",
				collision_url: "assets/debug-block.png",
				cols:2,rows:2,
				range:[1],
			}),
			debugLadder: await engine.addTexture({
				url: "assets/debug-block.png",
				collision_url: "assets/debug-block.png",
				cols:2,rows:2,
				range:[2],
			}),
			debugPlayer: await engine.addTexture({
				url: "assets/debug-player.png",
				collision_url: "assets/debug-player.png",
			}),
			hero: {
				still: await engine.addTexture({
					url: "assets/stick.png",
					collision_url: "assets/stick-collision.png",
					cols:5,rows:4,
					frameRate: 10,
					range:[0,3],
				}),
				run: await engine.addTexture({
					url: "assets/stick.png",
					collision_url: "assets/stick-collision.png",
					cols:5,rows:4,
					frameRate: 10,
					range:[4,7],
				}),
				jump: await engine.addTexture({
					url: "assets/stick.png",
					collision_url: "assets/stick-collision.png",
					cols:5,rows:4,
					frameRate: 5,
					range:[8,11],
				}),
				climb: await engine.addTexture({
					url: "assets/stick.png",
					collision_url: "assets/stick-collision.png",
					cols:5,rows:4,
					frameRate: 8,
					range:[12,15],
				}),
				dead: await engine.addTexture({
					url: "assets/stick.png",
					collision_url: "assets/stick-collision.png",
					cols:5,rows:4,
					frameRate: 10,
					range:[16,19],
				}),
			},
		};
		const spriteMapper = new SpriteMapper(this.spriteFactory, this.atlas);
		await spriteMapper.init(engine);

		const grid = new SpriteGrid(this, this.spriteFactory, spriteMapper);
		await grid.init();


		const [viewportWidth, viewportHeight] = config.viewport.size;

		this.backwall = this.spriteFactory.create({
			anim: this.atlas.backwall,
			size: [viewportWidth, viewportHeight],
			opacity: .5,
		});

		this.addPhysics(new Jump());
		this.addPhysics(new Control());
		this.addPhysics(new Gravity());
		this.addPhysics(new Movement());
		this.addPhysics(new Collision());

		grid.generate(`
				[][]    [][][][][][][][][][][][][]  [][][][]    [][][][][][][][][][][][][]HH[][][][]    [][][][][][][][][][][][][]  [][]
				[]    [][]                [][][][]  [][][][]    [][][][][][][][][][][][][]HH[][][][]    [][][][][][][][][][][][][]  [][]
				[]    []      8                       [][][]    [][][][][]  [][][][][][][]HH[][][][]    [][][][][][][][][][][][][]  [][]
				[]    []                        [][]  [][][]    [][][][][]  [][][][][][][]HH[][][][]    [][][][][][][][][][][][][]  [][]
				[]    [][]    []      [][][][]    []  ..              [][]  [][][][][][][]HH[][][][]    [][][][][][][][][][][][][]  [][]
				[]  [][]                  [][]    [][][][][]      []    []  []          []HH[][][][]    [][][][][][][][][][][][][]  [][]
				[]        [][]    [][][][]      [][][][][][] [] [][][]  []      VVVVVV          [][]                    [][]      
				[][]    [][][][]        [][][][][][][][][][]    [][]        VVVVVV  [][][][]          [][][][][][][]          [][]
				....    [][][][][][][]            [][][][][]    [][][]  [][][][][][][][][]  [][][][]    [][][][][][][][][][][][][]  [][]
				[][][][][][][][][][][][][][][][][][][][][][]    [][][][][][][][][][][][][]  [][][][][]  [][][][][][][][][][][][][]  [][]
			`);
	}

	onChange(key, value) {
	}

	async postInit() {
		await super.postInit();
	}

	onExit(engine) {
	}

	handleMouse(e) {
	}

	onDropOnOverlay(e) {
	}

	refresh(time, dt) {
		super.refresh(time, dt);
		this.engine.shift.goal.x = Math.min(0, - this.hero.x * 2 + 800);
		this.backwall.changePosition(-this.engine.shift.x/2, this.backwall.y, time);
//		this.engine.shift.goal.y = this.hero.y * 2 - 400;
	}
}