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

		const grid = [];
		const lines = map.split("\n");
		let row = 0;
		lines.forEach(line => {
			const fixedLine = line.trim();
			if (!fixedLine.length && row === 0) {
				return;
			}
			grid[row] = [];
			for (let i = 0; i < fixedLine.length; i+= 2) {
				const col = i / 2;
				const piece = fixedLine.substr(i, 2);
				grid[row][col] =  this.createBlock(col, row, piece.charAt(0), 0);
				if (!grid[row][col]) {
					this.createBlock(col, row, piece.charAt(1), 1);
				}
			}

			row++;
			str += "\n";
		});

		grid.forEach((line, row) => {
			line.forEach((cell, col) => {
				if (cell && cell.init) {
					cell.init(cell, col, row, grid);
				}
			});
		})
	}

	createBlock(col, row, type, index) {
		const block = this.spriteMapper.createBlock(col, row, type, index);
		if (block) {
			this.game[block.id] = block;
		}
		return block;
	}
}