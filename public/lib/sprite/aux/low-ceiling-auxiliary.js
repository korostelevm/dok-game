class LowCeilingAuxiliary extends Auxiliary {
	constructor(config, sprite) {
		super(config, sprite);
		sprite.lowceiling = 1;
		sprite.collide = 1;
	}

	gridInit(self, col, row, grid) {
		if (!grid[row-1] || !grid[row-1][col] || !grid[row-1][col].block) {
			self.canLand = true;
			self.changeOpacity(.7);
		}
		return self;
	}
}