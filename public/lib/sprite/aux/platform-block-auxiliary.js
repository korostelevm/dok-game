class PlatformBlockAuxiliary extends Auxiliary {
	constructor(config, sprite) {
		super(config, sprite);
		sprite.block = 1;
		sprite.collide = 1;
	}

	gridInit(self, col, row, grid) {
		if (!grid[row-1] || !grid[row-1][col] || !grid[row-1][col].block) {
			self.canLand = true;
			self.changeOpacity(.7);
		}
		if (!grid[row+1] || !grid[row+1][col] || !grid[row+1][col].block) {
			self.ceiling = true;
		}
	}
}