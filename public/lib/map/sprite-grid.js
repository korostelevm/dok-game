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
		const rowShift = 10 - lines.filter(line => line.trim().length).length;
		lines.forEach(line => {
			const fixedLine = line.trim();
			if (!fixedLine.length && row === 0) {
				return;
			}
			grid[row] = [];
			for (let i = 0; i < fixedLine.length; i+= 2) {
				const col = i / 2;
				const piece = fixedLine.substr(i, 2);
				grid[row][col] =  this.createBlock(col, row + rowShift, piece.charAt(0), piece.charAt(1));
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

		return grid;
	}

	createBlock(col, row, type, option) {
		const block = this.spriteMapper.createBlock(col, row, type, option);
		if (block) {
			this.game[block.id] = block;
		}
		return block;
	}
}