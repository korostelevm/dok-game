class SpriteMapper {
	constructor(game) {
		this.game = game;
		this.spriteFactory = game.spriteFactory;
		this.atlas = game.atlas;
		this.map = {
			' ': NullGenerator.instance,
			'.': NullGenerator.instance,
		};
	}

	async init(engine) {
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