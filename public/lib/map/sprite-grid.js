class SpriteGrid {
	constructor(game, spriteMappers) {
		this.game = game;
		this.spriteFactory = game.spriteFactory;
		this.spriteMappers = spriteMappers;
	}

	generate(map) {
		const grid = [];
		const asciiMap = [];
		const lines = typeof(map) === "string" ? map.split("\n") : map;

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

		let maxcols = 0;
		asciiMap.forEach((asciiRow, row) => {
			asciiRow.forEach((piece, col) => {
				if (!grid[row]) {
					grid[row] = [];
				} else if (grid[row][col]) {
					return;
				}
				const block = this.createBlock(col, row + rowShift, piece.charAt(0), piece.charAt(1));
				if (block) {
					grid[row][col] = block;
					block.col = col;
					block.row = row;
					block.grid = grid;
					block.asciiMap = asciiMap;
					if (block.onCreate) {
						block.onCreate(grid[row][col]);
					}
				}
			});
			maxcols = Math.max(maxcols, asciiRow.length);
		});

		grid.forEach((line, row) => {
			line.forEach((cell, col) => {
				if (cell && cell.gridInit) {
					cell.gridInit(cell);
				}
			});
		})

		return { grid, cols: maxcols, rows: grid.length };
	}

	makeBlock(spriteMappers, col, row, type, option) {
		for(let i = 0; i < spriteMappers.length; i++) {
			const block = spriteMappers[i].createBlock(col, row, type, option);
			if (block) {
				return block;
			}
		}
		return null;
	}

	createBlock(col, row, type, option) {
		const block = this.makeBlock(this.spriteMappers, col, row, type, option);
		if (block) {
			this.game[block.id] = block;
		}
		return block;
	}
}