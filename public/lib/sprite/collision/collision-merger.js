const BOTTOM = 1, RIGHT = 2;

class CollisionMerger {
	constructor() {
		this.directions = [BOTTOM, RIGHT];
	}

	merge(grid, cols, rows) {
		const blocks = {};
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				const sprite = grid[row][col];
				if (sprite && sprite.canMerge) {
					const blockArray = blocks[sprite.cellType] || (blocks[sprite.cellType] = []);
					blockArray.push({
						cellType: sprite.cellType,
						sprite,
						col, row,
						spancol: 1, spanrow: 1,
						unitSize: [sprite.size[0], sprite.size[1]],
						canMerge: sprite.canMerge,
					});
				}
			}
		}

		for (let cellType in blocks) {
			for (let pass = 0; pass < 10; pass++) {
//				ArrayUtils.shuffle(blocks[cellType]);
				let didMerge = false;
				blocks[cellType].forEach(b => {
					if (this.tryMerge(b, grid)) {
						didMerge = true;
					}
				});
				blocks[cellType] = blocks[cellType].filter(b => b.sprite.active);
				if (!didMerge) {
					console.log("merged after: ", pass);
					break;
				}
			}
		}
	}

	applyMerge(block, D, grid) {
		const { cellType, col, row, spancol, spanrow, unitSize } = block;
		if (D === RIGHT) {
			let expandSize = 0;
			for (let r = 0; r < spanrow;) {
				const b = grid.cell(col + spancol, row + r);
				grid.setCell(col + spancol, row + r, null)
				b.changeActive(false);
				expandSize = b.size[0];
				r += b.size[1] / unitSize[1];
			}
			block.sprite.changeSize(block.sprite.size[0] + expandSize, block.sprite.size[1]);
			block.spancol+= expandSize / unitSize[0];
		}
		if (D === BOTTOM) {
			let expandSize = 0;
			for (let c = 0; c < spancol;) {
				const b = grid.cell(col + c, row + spanrow);
				if (b.ceiling) {
					block.sprite.ceiling = true;
				}
				grid.setCell(col + c, row + spanrow, null);
				b.changeActive(false);
				expandSize = b.size[1];
				c += b.size[0] / unitSize[0];
			}
			block.sprite.changeSize(block.sprite.size[0], block.sprite.size[1] + expandSize);
			block.spanrow+= expandSize / unitSize[1];
		}
	}

	tryMerge(block, grid) {
		const { sprite, cellType, col, row, spancol, spanrow, unitSize } = block;
		if (!sprite.active) {
			return false;
		}
//		ArrayUtils.shuffle(this.directions);
		for (let i = 0; i < this.directions.length; i++) {
			const D = this.directions[i];
			if (D === RIGHT && (block.canMerge & Constants.HORIZONTAL_MERGE)) {
				let canMerge = true;
				let prev = null;
				for (let r = 0; r < spanrow;) {
					const b = grid.cell(col + spancol, row + r);
					if (!b || b.cellType !== cellType || !b.active || prev && prev.size[0] !== b.size[0]
						|| r + b.size[1] / unitSize[1] > spanrow) {
						canMerge = false;
						break;
					}
					prev = b;
					r += b.size[1] / unitSize[1];
				}
				if (canMerge) {
					this.applyMerge(block, D, grid);
					return true;
				}
			}
			if (D === BOTTOM && (block.canMerge & Constants.VERTICAL_MERGE)) {
				let canMerge = true;
				let prev = null;
				for (let c = 0; c < spancol;) {
					const b = grid.cell(col + c, row + spanrow);
					if (!b || b.cellType !== cellType || !b.active || prev && prev.size[1] !== b.size[1]
						|| c + b.size[0] / unitSize[0] > spancol) {
						canMerge = false;
						break;
					}
					prev = b;
					c += b.size[0] / unitSize[0];
				}
				if (canMerge) {
					this.applyMerge(block, D, grid);
					return true;
				}
			}
		}
		return false;
	}
}