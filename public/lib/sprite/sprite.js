//	sprite
//	- x, y, width, height
//	- hotspot
//	- rotation
//	- direction
//	- anim.src
//	- anim (cols, rows, frameRate)


class Sprite {
	constructor(data) {
		this.name = data.name || "";
		this.x = data.x || 0;
		this.y = data.y || 0;
		this.size = data.size || [0, 0];
		this.hotspot = data.hotspot || [0, 0];
		this.rotation = data.rotation || 0;
		this.opacity = data.opacity !== undefined ? data.opacity : 1;

		this.direction = data.direction || 1;
		this.anim = data.anim;
		this.collisionBox = {
			top:0,
			left:0,
			bottom:0,
			right:0,
		};

		this.updated = {
			sprite: 0,
			spriteSheet: 0,
			animation: 0,
			updateTime: 0,
			direction: 0,
			opacity: 0,
		};
	}

	getAnimationTime() {
		const { anim, updated } = this;
		const frameOffset = anim.firstFrame - anim.startFrame;
		const frameDuration = 1000 / anim.frameRate;
		return updated.animation - frameOffset * frameDuration;
	}

	getAnimationFrame(time) {
		const { anim, updated } = this;
		const frameDuration = 1000 / anim.frameRate;
		const animationElapsed = time - updated.animation;
		const framesElapsed = Math.floor(animationElapsed / frameDuration);
		const frameOffset = anim.firstFrame - anim.startFrame;
		const frameCount = (anim.endFrame - anim.firstFrame) + 1;
		const currentFrame = anim.startFrame + (frameOffset + framesElapsed) % frameCount;
		return currentFrame;
	}

	changePosition(x, y, time) {
		if (this.x !== x || this.y !== y) {
			this.x = x;
			this.y = y;
			this.updated.sprite = time;
			return true;
		}
		return false;
	}

	changeRotation(rotation, time) {
		if (this.rotation !== rotation) {
			this.rotation = rotation;
			this.updated.sprite = time;
			return true;
		}
		return false;
	}

	changeOpacity(opacity, time) {
		if (this.opacity !== opacity) {
			this.opacity = opacity;
			this.updated.opacity = time;
			return true;
		}
		return false;
	}

	changeDirection(direction, time) {
		if (this.direction !== direction) {
			this.direction = direction;
			this.updated.direction = time;
			return true;
		}
		return false;
	}

	changeAnimation(anim, time, updateTime) {
		if (this.anim !== anim) {
			if (!anim) {
				console.warn("anim is null.");
				return false;
			}
			this.anim = anim;
			this.updated.animation = time;
			this.updated.updateTime = updateTime || time;
			return true;
		}
		return false;
	}

	resetAnimation(time) {
		this.updated.animation = time;
		this.updated.updateTime = time;
	}

	getCollisionBox(time) {
		const rect = this.anim.getCollisionBoxNormalized(this.getAnimationFrame(time));
		if (!rect) {
			return null;
		}
		const [ width, height ] = this.size;
		const left = this.x - this.hotspot[0];
		const top = this.y - this.hotspot[1];
		this.collisionBox.left = left + rect.left * width;
		this.collisionBox.right = left + rect.right * width;
		this.collisionBox.top = top + rect.top * height;
		this.collisionBox.bottom = top + rect.bottom * height;
		return this.collisionBox;
//		const [ spriteWidth, spriteHeight ] = this.size;
		// const cellLeft = this.direction < 0 ? this.anim.spriteWidth - rect.right : rect.left 
		// const left = (this.x - this.hotspot[0]) / 2 + cellLeft * 2;
		// const top = (this.y - this.hotspot[1]) / 2 + rect.top * 2;
		// const width = (rect.right - rect.left + 1) * 2;
		// const height = (rect.bottom - rect.top + 1) * 2;
		// this.collisionBox.left = left;
		// this.collisionBox.top = top;
		// this.collisionBox.right = left + width - 1;
		// this.collisionBox.bottom = top + height - 1;
		// return this.collisionBox;
	}
}