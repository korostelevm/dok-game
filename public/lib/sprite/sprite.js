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
		this.anim = data.anim;

		this.updated = {
			sprite: 0,
			spriteSheet: 0,
			animation: 0,
			updateTime: 0,
			direction: 0,
			opacity: 0,
		};
	}

	changeOpacity(opacity, time) {
		if (this.opacity !== opacity) {
			this.opacity = opacity;
			this.updated.opacity = time;
		}
	}

	changeDirection(direction, time) {
		if (this.direction !== direction) {
			this.direction = direction;
			this.updated.direction = time;
		}
	}

	changeAnimation(anim, time) {
		if (this.anim !== anim) {
			this.anim = anim;
			this.updated.animation = time;
			this.updated.updateTime = time;
		}
	}

	resetAnimation(time) {
		this.updated.animation = time;
		this.updated.updateTime = time;
	}
}