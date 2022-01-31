class CollisionBox {
	constructor(sprite, collisionFrame, showCollisionBox) {
		this.sprite = sprite;
		this.top = 0;
		this.left = 0;
		this.bottom = 0;
		this.right = 0;
		this.close = 0;
		this.far = 0;
		this.width = 0;
		this.height = 0;
		this.depth = 0;
		this.isDirty = true;
		this.frame = -1;
		this.collisionFrame = collisionFrame || null;
		this.time = 0;
		this.lastPosition = [null,null,null];
		this.showCollisionBox = showCollisionBox;
		if (this.collisionFrame) {
			this.width = this.collisionFrame.right - this.collisionFrame.left;
			this.height = this.collisionFrame.bottom - this.collisionFrame.top;
			this.depth = this.collisionFrame.far - this.collisionFrame.close;
		}
	}

	set showCollisionBox(value) {
		if (value && !this.display) {
			this.display = new CollisionBoxDisplay(this, value);
		}
		this.changeActive(value);
	}

	set dirty(value) {
		this.isDirty = value;
		if (this.isDirty) {
			this.changeActive(this.sprite.active);
			if (this.display) {
				this.display.repositionSprites(this.sprite.engine.lastTime);
			}
		}
	}

	get dirty() {
		return this.isDirty;
	}

	get centerX() {
		return (this.left + this.right) / 2;
	}

	get centerY() {
		return (this.top + this.bottom) / 2;
	}

	get centerZ() {
		return (this.close + this.far) / 2;
	}

	containsPoint(x, y, z) {
		const px = x || 0, py = y || 0, pz = z || 0;
		return this.left <= px && px <= this.right
			&& this.top <= py && py <= this.bottom
			&& this.close <= pz && pz <= this.far;
	}

	containsPoint2d(x, y) {
		const px = x || 0, py = y || 0;
		return this.left <= px && px <= this.right
			&& this.top <= py && py <= this.bottom;
	}

	getCollisionBox(t, forceRecalculate) {
		const time = t || this.sprite.engine.lastTime
		if (this.time === time && !this.dirty && !forceRecalculate) {
			return this;
		}

		if (this.collisionFrame) {
			this.calculateCollisonBoxFromFrame(this.collisionFrame, time, forceRecalculate);
			return this;
		}

		const frame = this.sprite.getAnimationFrame(time);
		if (this.frame === frame && !this.dirty) {
			return this;
		}
		this.frame = frame;
		this.time = time;
		const animRect = this.sprite.anim.getCollisionBoxNormalized(frame);
		if (!animRect) {
			return null;
		}
		this.calculateCollisonBoxFromAnimation(animRect, time);
		return this;
	}

	changeActive(value) {
		if (this.display) {
			this.display.changeActive(value);
		}
	}

	calculateCollisonBoxFromFrame(collisionFrame, time, forceRecalculate) {
		const spritePosition = this.sprite.getRealPosition(time);
		if (this.lastPosition[0] === spritePosition[0]
			&& this.lastPosition[1] === spritePosition[1]
			&& this.lastPosition[2] === spritePosition[2]
			&& !forceRecalculate) {
			return;
		}
		this.left = collisionFrame.left + spritePosition[0];
		this.right = collisionFrame.right + spritePosition[0];
		this.top = collisionFrame.top + spritePosition[1];
		this.bottom = collisionFrame.bottom + spritePosition[1];
		this.close = collisionFrame.close + spritePosition[2];
		this.far = collisionFrame.far + spritePosition[2];
		this.lastPosition[0] = spritePosition[0];
		this.lastPosition[1] = spritePosition[1];
		this.lastPosition[2] = spritePosition[2];
		this.dirty = false;
	}

	calculateCollisonBoxFromAnimation(animRect, time) {
		const sprite = this.sprite;
		const flipX = sprite.direction < 0;
		const flipY = sprite.ydirection < 0;
		const rLeft = flipX ? 1 - animRect.right : animRect.left;
		const rRight = flipX ? 1 - animRect.left : animRect.right;
		const rTop = flipY ? 1 - animRect.bottom : animRect.top;
		const rBottom = flipY ? 1 - animRect.top : animRect.bottom;
		const rClose = animRect.close;
		const rFar = animRect.far;

		const collisionPadding = sprite.anim.collisionPadding ?? 0;
		const width = sprite.size[0];
		const height = sprite.size[1];
		const spritePosition = sprite.getRealPosition(time);
		const left = spritePosition[0] - sprite.anim.hotspot[0] * width;
		const top = spritePosition[1] - sprite.anim.hotspot[1] * height;
		const close = spritePosition[2];

		this.left = left + rLeft * width - collisionPadding;
		this.right = left + rRight * width + collisionPadding;
		this.top = top + rTop * height - collisionPadding;
		this.bottom = top + rBottom * height + collisionPadding;
		this.close = close + rClose;
		this.far = close + rFar;
		this.width = this.right - this.left;
		this.height = this.bottom - this.top;
		this.depth = this.far - this.close;
		this.dirty = false;
	}	
}