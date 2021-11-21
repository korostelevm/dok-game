//	sprite
//	- x, y, width, height
//	- hotspot
//	- rotation
//	- direction
//	- anim.src
//	- anim (cols, rows, frameRate)


class Sprite {
	constructor(data, time, properties) {
		this.name = data.name || "";
		this.x = data.x || 0;
		this.y = data.y || 0;
		this.z = data.z || 0;
		this.size = data.size || [0, 0];
		this.hotspot = data.hotspot || [0, 0];
		this.rotation = data.rotation || 0;
		this.opacity = data.opacity !== undefined ? data.opacity : 1;
		this.crop = [1, 1];

		this.direction = data.direction || 1;
		this.vdirection = data.vdirection || 1;
		this.anim = data.anim;
		this.collisionBox = {
			top:0,
			left:0,
			bottom:0,
			right:0,
		};
		this.properties = properties || {};
		this.onChange = {};

		this.updated = {
			sprite: time,
			spriteSheet: time,
			animation: time,
			updateTime: time,
			direction: time,
			opacity: time,
			crop: time,
		};
	}

	setProperty(key, value) {
		const oldValue = this.properties[key];
		if (oldValue !== value) {
			this.properties[key] = value;
			this.onUpdate(key, value);
		}
	}

	onUpdate(key, value, initial) {
		if (this.onChange[key]) {
			this.onChange[key](this, value, initial);
		}
	}

	getAnimationTime() {
		const { anim, updated } = this;
		if (!anim) {
			console.error("Anim not available for " + this.name);
			return 0;
		}
		const frameOffset = anim.firstFrame - anim.startFrame;
		const frameDuration = 1000 / anim.frameRate;
		return updated.animation - frameOffset * frameDuration;
	}

	getAnimationFrame(time) {
		const { anim, updated } = this;
		if (!anim) {
			console.error("Anim not available for " + this.name);
			return 0;
		}
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

	changeSize(width, height, time) {
		if (this.size[0] !== width || this.size[1] !== height) {
			this.size[0] = width;
			this.size[1] = height;
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

	changeVDirection(vdirection, time) {
		if (this.vdirection !== vdirection) {
			this.vdirection = vdirection;
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

	changeCrop(x, y, time) {
		if (this.crop[0] !== x || this.crop[1] !== y) {
			this.crop[0] = x;
			this.crop[1] = y;
			this.updated.crop = time;
			return true;
		}
		return false;
	}

	changeHotSpot(x, y, time) {
		if (this.hotspot[0] !== x || this.hotspot[1] !== y) {
			this.hotspot[0] = x;
			this.hotspot[1] = y;
			this.updated.hotspot = time;
			return true;
		}
		return false;
	}

	resetAnimation(time) {
		this.updated.animation = time;
		this.updated.updateTime = time;
	}

	flipRect(rect, flipH, flipV) {
		if (!rect) {
			return null;
		}
		return {
			left: flipH ? 1 - rect.right : rect.left,
			right: flipH ? 1 - rect.left : rect.right,
			top: flipV ? 1 - rect.bottom : rect.top,
			bottom: flipV ? 1 - rect.top : rect.bottom,
		};
	}

	getCollisionBox(time) {
		const flipH = this.direction < 0;
		const flipV = this.vdirection < 0;
		const rect = this.flipRect(this.anim.getCollisionBoxNormalized(this.getAnimationFrame(time)), flipH, flipV);
		if (!rect) {
			return null;
		}
		const collisionPadding = this.anim.collisionPadding ?? 0;
		const [ width, height ] = this.size;
		const left = this.x - this.hotspot[0];
		const top = this.y - this.hotspot[1];
		this.collisionBox.left = left + rect.left * width * this.crop[0] - collisionPadding;
		this.collisionBox.right = left + rect.right * width * this.crop[0] + collisionPadding;
		this.collisionBox.top = top + rect.top * height * this.crop[1] - collisionPadding;
		this.collisionBox.bottom = top + rect.bottom * height * this.crop[1] + collisionPadding;

		return this.collisionBox;
	}
}