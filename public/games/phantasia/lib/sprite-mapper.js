class SpriteMapper {
	constructor(spriteFactory, atlas) {
		this.spriteFactory = spriteFactory;
		this.atlas = atlas;

		this.map = {
			'8': (col, row) => {
				return this.spriteFactory.create({
					name: "hero",
					anim: this.atlas.debugPlayer,
					size: [30, 35],
					x: 40 * col, y: 40 * row,
				}, {
					gravity: .2,
					motion: 1,
					collide: 1,
					jump: 5,
					control: 1,
					onCollide: (self, sprite, xPush, yPush) => {
						if (Math.abs(yPush) < Math.abs(xPush)) {
							self.dy += yPush;
							self.changePosition(self.x, self.y + yPush);
							if (yPush < 0) {
								self.rest = self.engine.lastTime;
							}
						} else {
							self.dx += xPush;
							self.changePosition(self.x + xPush, self.y);
							if (sprite.canClimb && self.dy < .1 && self.dy > 0 && self.collisionBox.top < sprite.collisionBox.top) {
								self.climb = self.engine.lastTime;
								self.climbSide = xPush < 0 ? 1 : -1;
							}
						}
					},
				});
			},
			'[': (col, row, index) => {
				return this.spriteFactory.create({
					name: `block_${col}_${row}_${index}`,
					anim: this.atlas.debugBlock,
					size: [40, 40],
					x: 40 * col, y: 40 * row,
				}, {
					collide: 1,
					init: (self, col, row, grid) => {
						if (!grid[row-1] || !grid[row-1][col]) {
							self.canClimb = true;
							self.changeOpacity(.7);
						}
					},
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