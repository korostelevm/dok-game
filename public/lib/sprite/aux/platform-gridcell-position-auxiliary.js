class PlatformGridcellPositionAuxiliary extends Auxiliary {
	constructor(config) {
		super(config);
	}

	decorate(sprite) {
		const [cellWidth, cellHeight, cellDepth] = this.config.cellSize || [];
		const [xOffset, yOffset, zOffset] = this.config.offset || [];
		sprite.changePosition(
			(cellWidth||0) * sprite.col + (xOffset||0),
			(cellHeight||0) * (sprite.row + sprite.rowShift) + (yOffset||0),
			(cellDepth||0) * sprite.row + (yOffset||0)
		);
	}
}