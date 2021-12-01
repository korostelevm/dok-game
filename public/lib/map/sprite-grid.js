class SpriteGrid {
	constructor(game, spriteFactory, spriteMapper) {
		this.game = game;
		this.spriteFactory = spriteFactory;
		this.spriteMapper = spriteMapper;
	}

	async init() {
	}

	generate(map) {
		let str = "";

		const lines = map.split("\n");
		let row = 0;
		lines.forEach(line => {
			const fixedLine = line.trim();
			if (!fixedLine.length && row === 0) {
				return;
			}
			for (let i = 0; i < fixedLine.length; i+= 2) {
				const col = i / 2;
				const piece = fixedLine.substr(i, 2);
				this.createBlock(col, row, piece.charAt(0));
				this.createBlock(col, row, piece.charAt(1));
			}

			row++;
			str += "\n";
		});
	}

	createBlock(col, row, type) {
		const block = this.spriteMapper.createBlock(col, row, type);
		if (block) {
			this.game[block.id] = block;
		}
	}
}