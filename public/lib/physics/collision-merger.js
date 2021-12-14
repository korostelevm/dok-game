const TOP = 1, BOTTOM = 2, LEFT = 3, RIGHT = 4;

class CollisionMerger {
	constructor() {
		this.directions = [TOP, RIGHT, BOTTOM, LEFT];
	}

	merge(grid, cols, rows) {
		const blocks = {};
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				const sprite = grid[row][col];
				if (sprite && sprite.canMerge) {
					const blockArray = blocks[sprite.type] || (blocks[sprite.type] = []);
					blockArray.push({
						sprite,
						col, row,
						spancol: 1, spanrow: 1,
					});
				}
			}
		}
		console.log(blocks);
	}

	tryMerge(block, grid) {
		ArrayUtils.shuffle(this.directions);
		for (let i = 0; i < this.directions.length; i++) {
			const D = this.directions[i];
			if (D === TOP) {
				let canMerge = true;
				for (let c = 0; c < spancol; c++) {
					const b = grid.at(c, block.row - 1);
					if (!b || b.type !== block.type) {
						canMerge = false;
						break;
					}
				}
				if (canMerge) {
					
				}
			}
		}
	}
}