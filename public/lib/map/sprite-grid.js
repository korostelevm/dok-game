class SpriteGrid {
	constructor(game, spriteFactory, spriteMapper) {
		this.game = game;
		this.spriteFactory = spriteFactory;
		this.spriteMapper = spriteMapper;
	}

	async init() {
	}

	generate(map) {
		const grid = [];
		const asciiMap = [];
		const lines = map.split("\n");

		let row = 0;
		const rowShift = 10 - lines.filter(line => line.trim().length).length;

		lines.forEach(line => {
			const fixedLine = line.trim();
			if (!fixedLine.length && row === 0) {
				return;
			}
			asciiMap[row] = [];
			for (let i = 0; i < fixedLine.length; i+= 2) {
				const col = i / 2;
				asciiMap[row][col] = fixedLine.substr(i, 2);
			}

			row++;
		});

		asciiMap.forEach((asciiRow, row) => {
			asciiRow.forEach((piece, col) => {
				if (!grid[row]) {
					grid[row] = [];
				} else if (grid[row][col]) {
					return;
				}
				const block = this.createBlock(col, row + rowShift, piece.charAt(0), piece.charAt(1));
				grid[row][col] = block;
				if (block && block.onCreate) {
					block.onCreate(grid[row][col], col, row, asciiMap, grid);
				}
			})
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