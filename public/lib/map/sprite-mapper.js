class SpriteMapper {
	constructor(game, mapping) {
		this.game = game;
		this.spriteFactory = game.spriteFactory;
		this.atlas = game.atlas;
		this.map = {
			' ': NullGenerator.instance,
			'.': NullGenerator.instance,
		};
		this.mapping = mapping || {};
	}

	async init(engine) {
		for (let m in this.mapping) {
			const config = this.mapping[m];
			const generatorObj = config.generator ? nameToClass(config.generator) : GeneratorFromConfig;
			this.map[m] = new generatorObj(config);
		}
	}

	createBlock(col, row, cellType, option) {
		const generator = this.map[cellType];
		if (generator) {
			const block = generator.generate(this, col, row, option);
			if (block) {
				block.cellType = cellType;
			}
			return block;
		}
		return null;
	}
}