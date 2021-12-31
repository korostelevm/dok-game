class CollisionBox {
	constructor(sprite, collisionFrame) {
		this.sprite = sprite;
		this.top = 0;
		this.left = 0;
		this.bottom = 0;
		this.right = 0;
		this.close = 0;
		this.far = 0;
		this.dirty = true;
		this.frame = -1;
		this.collisionFrame = collisionFrame || null;
		this.time = 0;
	}

	getCenterX(time) {
		const box = this.getCollisionBox(time);
		return (box.left + box.right) / 2;
	}

	getCenterY(time) {
		const box = this.getCollisionBox(time);
		return (box.top + box.bottom) / 2;
	}

	getCollisionBox(t) {
		const time = t || this.sprite.game.engine.lastTime
		if (this.time === time && !this.dirty) {
			return this;
		}

		if (this.collisionFrame) {
			this.calculateCollisonBoxFromFrame(this.collisionFrame);
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
		this.calculateCollisonBoxFromAnimation(animRect);
		return this;
	}

	calculateCollisonBoxFromFrame(collisionFrame) {
		const { x, y, z } = this.sprite;
		this.left = collisionFrame.left + x;
		this.right = collisionFrame.right + x;
		this.top = collisionFrame.top + y;
		this.bottom = collisionFrame.bottom + y;
		this.close = collisionFrame.close + z;
		this.far = collisionFrame.far + z;
		this.dirty = false;
	}

	calculateCollisonBoxFromAnimation(animRect) {
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
		const left = sprite.x - sprite.anim.hotspot[0] * width;
		const top = sprite.y - sprite.anim.hotspot[1] * height;
		const close = sprite.z;
		this.left = left + rLeft * width - collisionPadding;
		this.right = left + rRight * width + collisionPadding;
		this.top = top + rTop * height - collisionPadding;
		this.bottom = top + rBottom * height + collisionPadding;
		this.close = close + rClose;
		this.far = close + rFar;
		this.dirty = false;
	}	
}