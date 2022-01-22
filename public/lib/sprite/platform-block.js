class PlatformBlock extends Sprite {
	constructor(data, time, properties, engine, game) {
		super(data, time, properties, engine, game);
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