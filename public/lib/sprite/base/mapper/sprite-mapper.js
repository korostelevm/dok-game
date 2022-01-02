class SpriteMapper {
	constructor(game) {
		this.game = game;
		this.spriteFactory = game.spriteFactory;
		this.atlas = game.atlas;
		this.map = {};
	}

	async init(engine) {
	}


	createBlock(col, row, cellType, option) {
		const generator = this.map[cellType];
		if (generator) {
			const block = generator.call(this, col, row, option);
			block.cellType = cellType;
			return block;
		}
		return null;
	}
}