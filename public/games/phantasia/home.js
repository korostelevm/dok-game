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
			}),
			debugPlayer: await engine.addTexture({
				url: "assets/debug-player.png",
				collision_url: "assets/debug-player.png",
			}),
		};

		const grid = new SpriteGrid(this, this.spriteFactory, new SpriteMapper(this.spriteFactory, this.atlas));
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
				[][]    [][][][][][][][][][][][][]  [][][][]    [][][][][][][][][][][][][]  [][][][]    [][][][][][][][][][][][][]  [][]
				[]    [][]                [][][][]  [][][][]    [][][][][][][][][][][][][]  [][][][]    [][][][][][][][][][][][][]  [][]
				[]    []      8                       [][][]    [][][][][]  [][][][][][][]  [][][][]    [][][][][][][][][][][][][]  [][]
				[]    []                        [][]  [][][]    [][][][][]  [][][][][][][]  [][][][]    [][][][][][][][][][][][][]  [][]
				[]    [][]    []      [][][][]    []  ..              [][]  [][][][][][][]  [][][][]    [][][][][][][][][][][][][]  [][]
				[]  [][]                  [][]    [][][][][]      []    []  []          []  [][][][]    [][][][][][][][][][][][][]  [][]
				[]        [][]    [][][][]      [][][][][][] [] [][][]  []      [][][]          [][]                    [][]      
				[][]    [][][][]        [][][][][][][][][][]    [][]        [][][][]  [][][][]        [][][][][][][]          [][]
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