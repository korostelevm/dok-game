class PlatformGridcellPositionAuxiliary {
	constructor(config) {
		this.config = config;
	}

	decorate(sprite) {
		const [cellWidth, cellHeight, cellDepth] = this.config.cellSize || [];
		const [xOffset, yOffset, zOffset] = this.config.offset || [];
		console.log(sprite.id, sprite.x, sprite.y, sprite.z, sprite.col, sprite.row);
		sprite.changePosition(
			(cellWidth||0) * sprite.col + (xOffset||0),
			(cellHeight||0) * sprite.row + (yOffset||0),
			(cellDepth||0) * sprite.row + (yOffset||0)
		);
		console.log(sprite.id, sprite.x, sprite.y, sprite.z, sprite.col, sprite.row);
	}
}