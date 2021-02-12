//	sprite
//	- x, y, width, height
//	- hotspot
//	- rotation
//	- direction
//	- anim.src
//	- anim (cols, rows, frameRate)


class Sprite {
	constructor(data) {
		this.x = data.x || 0;
		this.y = data.y || 0;
		this.size = data.size || [0, 0];
		this.hotspot = data.hotspot || [0, 0];
		this.rotation = data.rotation || 0;
		this.opacity = data.opacity !== undefined ? data.opacity : 1;

		this.direction = data.direction || 1;
		this.anim = data.anim || {
			cols: 1,
			rows: 1,
			frameRate: 60,
		};

		this.updated = {
			sprite: 0,
			animation: 0,
		};
	}
}