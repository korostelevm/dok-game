class SpriteMapper {
	constructor(spriteFactory, atlas) {
		this.spriteFactory = spriteFactory;
		this.atlas = atlas;

		this.map = {
			'8': (col, row) => {
				return this.spriteFactory.create({
					name: "hero",
					anim: this.atlas.debugPlayer,
					size: [40, 40],
					x: 40 * col, y: 40 * row,
				}, {
					gravity: .2,
					motion: 1,
					collide: 1,
					jump: 5,
					control: 1,
					onCollide: (self, sprite, xPush, yPush) => {
						if (Math.abs(yPush) < Math.abs(xPush)) {
							self.dy = 0;
							self.changePosition(self.x, self.y + yPush);
							if (yPush < 0) {
								self.rest = self.engine.lastTime;
							}
						} else {
							self.dx = 0;
							self.changePosition(self.x + xPush, self.y);
						}
					},
				});
			},
			'[': (col, row) => {
				return this.spriteFactory.create({
					anim: this.atlas.debugBlock,
					size: [40, 40],
					x: 40 * col, y: 40 * row,
				}, {
					collide: 1,
				});
			},
		};
	}

	createBlock(col, row, type) {
		const generator = this.map[type];
		if (generator) {
			return generator.call(this, col, row);
		}
		return null;
	}
}