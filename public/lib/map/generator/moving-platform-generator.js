class MovingPlatformGenerator extends Generator {
	generate(spriteFactory, col, row, option) {
		if (!this.movingPlatform) {
			this.movingPlatform = spriteMapper.spriteFactory.create({
				name: `mover_${col}_${row}`,
				anim: spriteMapper.atlas.debugMovingPlatform,
				size: [40, 40],
				x: 40 * col, y: 40 * row,
			}, {
				path: [],
				collide: 1, canLand: true,
				index: 0,
				speed: 2,
				onCreate: (self) => {
					const { col, row, grid, asciiMap } = self;
					let w = 1, h = 1;
					for (let i = 1; asciiMap[row][col+i] === "--"; i++) {
						w ++;
					}
					for (let i = 1; asciiMap[row+i] && asciiMap[row+i][col] === "--"; i++) {
						h ++;
					}
					for (let y = 0; y < h; y++) {
						if (!grid[row + y]) {
							grid[row + y] = [];
						}
						for (let x = 0; x < w; x++) {
							if (!grid[row + y][col + x]) {
								grid[row + y][col + x] = self;
							}
						}
					}


					self.path[self.index].size = [w * 40, h * 40];
				},
				onPlatform: (self, lander) => {
					self.lander = lander;
				},
				onRefresh: platform => {
					const previousSpot = platform.path[(platform.index + platform.path.length - 1) % platform.path.length];
					const nextSpot = platform.path[platform.index];
					const dx = nextSpot.x - platform.x;
					const dy = nextSpot.y - platform.y;
					const dist = Math.sqrt(dx * dx + dy * dy);
					if (dist < 0.0001) {
						platform.index = (platform.index + 1) % platform.path.length;								
						return;
					}
					const lander = platform.lander;

					const speed = Math.min(dist, platform.speed);
					const ddx = dist < 0.1 ? dx : dx / dist * speed;
					const ddy = dist < 0.1 ? dy : dy / dist * speed;

					platform.changePosition(platform.x + ddx, platform.y + ddy, platform.z);

					const xProgressSize = nextSpot.x - previousSpot.x;
					const xProgress = xProgressSize === 0 ? 0 : (platform.x - previousSpot.x) / xProgressSize;
					const yProgressSize = nextSpot.y - previousSpot.y;
					const yProgress = yProgressSize === 0 ? 0 : (platform.y - previousSpot.y) / yProgressSize;
					const progress = (xProgress + yProgress) / ((xProgressSize !== 0 ? 1 : 0) + (yProgressSize !== 0 ? 1 : 0));
					const regress = (1 - progress);
					const w = nextSpot.size[0] * progress + previousSpot.size[0] * regress;
					const h = nextSpot.size[1] * progress + previousSpot.size[1] * regress;

					const preWidth = platform.size[0];
					const preRelativeX = lander ? (lander.x - platform.x) : 0;
					platform.changeSize(w, h);

					if (lander) {
						const newRelativeX = preRelativeX / preWidth * w;
						const shiftX = newRelativeX - preRelativeX;
						lander.changePosition(lander.x + ddx + shiftX, lander.y + ddy, lander.z);
					}
				},
			});
		}
		const index = parseInt(option);
		this.movingPlatform.index = index;
		this.movingPlatform.path[index] = {
			x: 40 * col, y: 40 * row, size: [40, 40],
		};
		if (index === 0) {
			this.movingPlatform.changePosition(40 * col, 40 * row, this.movingPlatform.z);
		}
		return this.movingPlatform;
	}
}