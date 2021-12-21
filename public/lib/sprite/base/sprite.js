//	sprite
//	- x, y, width, height
//	- hotspot
//	- rotation
//	- direction
//	- anim.src
//	- anim (cols, rows, frameRate)


class Sprite {
	constructor(data, time, properties, engine) {
		this.data = data;
		this.engine = engine;
		this.type = this.constructor.name;
		this.id = data.id;
		this.name = data.name || "";
		this.x = data.x || 0;
		this.y = data.y || 0;
		this.z = data.z || 0;
		this.size = [... engine.translate(data.size) || [0, 0]];
		this.hotspot = [... data.hotspot || [0, 0]];
		this.rotation = [... data.rotation || [0, 0, 0]];
		this.opacity = data.opacity !== undefined ? data.opacity : 1;
		this.crop = [1, 1];
		this.active = true;
		this.isHud = data.hud ? 1 : 0;
		this.remember = data.remember || false;
		this.motion = [... data.motion || [0, 0, 0]];
		this.acceleration = [... data.acceleration || [0, 0, 0]];

		this.direction = data.direction || 1;
		this.vdirection = data.vdirection || 1;
		this.anim = data.anim;
		if (!this.anim) {
			console.warn("Anim doesn't exist.");
			throw new Error("");
		}
		this.collisionBox = {
			top:0,
			left:0,
			bottom:0,
			right:0,
			dirty: true,
		};
		this.properties = properties || {};
		this.onChange = {
			position: (self, {x, y, z}) => {
				self.changePosition(x, y, z);
			},
		};

		this.updated = {
			sprite: time,
			spriteSheet: time,
			animation: time,
			updateTime: time,
			motionTime: time,
			direction: time,
			opacity: time,
			crop: time,
			isHud: time,
			motion: time,
			acceleration: time,
		};
		this.engine.updater.add(this);
	}

	onExit(game) {
		if (this.remember) {
			this.setProperty("position", {x: this.x, y: this.y, z: this.z});
		}
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
		return updated.animation - frameOffset * anim.frameDuration;
	}

	getAnimationFrame(time) {
		const { anim, updated } = this;
		if (!anim) {
			console.error("Anim not available for " + this.name);
			return 0;
		}
		const animationElapsed = time - updated.animation;
		const framesElapsed = Math.floor(animationElapsed / anim.frameDuration);
		const frameOffset = anim.firstFrame - anim.startFrame;
		const frameCount = (anim.endFrame - anim.firstFrame) + 1;
		const currentFrame = anim.startFrame + (frameOffset + framesElapsed) % frameCount;
		return currentFrame;
	}

	changePosition(x, y, z, time) {
		if (this.x !== x || this.y !== y || this.z !== z) {
			this.x = x;
			this.y = y;
			this.z = z;
			this.updated.sprite = time || this.engine.lastTime;
			this.collisionBox.dirty = true;
			this.needUpdate();
			return true;
		}
		return false;
	}

	changeSize(width, height, time) {
		if (this.size[0] !== width || this.size[1] !== height) {
			this.size[0] = width;
			this.size[1] = height;
			this.updated.sprite = time || this.engine.lastTime;
			this.collisionBox.dirty = true;
			this.needUpdate();
			return true;
		}
		return false;
	}

	changeRotation(rotX, rotY, rotZ, time) {
		if (this.rotation[0] !== rotX || this.rotation[1] !== rotY || this.rotation[2] !== rotZ) {
			this.rotation[0] = rotX;
			this.rotation[1] = rotY;
			this.rotation[2] = rotZ;
			this.updated.sprite = time || this.engine.lastTime;
			this.collisionBox.dirty = true;
			this.needUpdate();
			return true;
		}
		return false;
	}

	changeOpacity(opacity, time) {
		if (this.opacity !== opacity) {
			this.opacity = opacity;
			this.updated.opacity = time || this.engine.lastTime;
			this.needUpdate();
			return true;
		}
		return false;
	}

	changeHud(isHud, time) {
		if (this.isHud !== isHud) {
			this.isHud = isHud;
			this.updated.isHud = time || this.engine.lastTime;
			this.needUpdate();
			return true;
		}
		return false;
	}

	changeDirection(direction, time) {
		if (this.direction !== direction) {
			this.direction = direction;
			this.updated.direction = time || this.engine.lastTime;
			this.collisionBox.dirty = true;
			this.needUpdate();
			return true;
		}
		return false;
	}

	changeVDirection(vdirection, time) {
		if (this.vdirection !== vdirection) {
			this.vdirection = vdirection;
			this.updated.direction = time || this.engine.lastTime;
			this.collisionBox.dirty = true;
			this.needUpdate();
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
			this.updated.animation = time || this.engine.lastTime;
			this.updated.updateTime = updateTime || time || this.engine.lastTime;
			this.collisionBox.dirty = true;
			this.needUpdate();
			return true;
		}
		return false;
	}

	changeCrop(x, y, time) {
		if (this.crop[0] !== x || this.crop[1] !== y) {
			this.crop[0] = x;
			this.crop[1] = y;
			this.updated.crop = time || this.engine.lastTime;
			this.collisionBox.dirty = true;
			this.needUpdate();
			return true;
		}
		return false;
	}

	changeHotSpot(x, y, time) {
		if (this.hotspot[0] !== x || this.hotspot[1] !== y) {
			this.hotspot[0] = x;
			this.hotspot[1] = y;
			this.updated.hotspot = time || this.engine.lastTime;
			this.collisionBox.dirty = true;
			this.needUpdate();
			return true;
		}
		return false;
	}

	changeActive(value, time) {
		if (this.active !== value) {
			this.active = value;
			this.updated.active = time || this.engine.lastTime;
			this.needUpdate();
			return true;
		}
		return false;
	}

	changeMotion(dx, dy, dz, time) {
		if (this.motion[0] !== dx || this.motion[1] !== dy || this.motion[2] !== dz) {
			this.recalculatePosition(time || this.engine.lastTime);
			this.motion[0] = dx;
			this.motion[1] = dy;
			this.motion[2] = dz;
			this.updated.motion = time || this.engine.lastTime;
			this.needUpdate();
			return true;
		}
		return false;
	}

	changeAcceleration(ax, ay, az, time) {
		if (this.acceleration[0] !== ax || this.acceleration[1] !== ay || this.acceleration[2] !== az) {
			this.recalculatePosition(time);
			this.acceleration[0] = ax;
			this.acceleration[1] = ay;
			this.acceleration[2] = az;
			this.updated.motion = time || this.engine.lastTime;
			this.needUpdate();
			return true;
		}
		return false;
	}

	needUpdate() {
		this.engine.updater.add(this);
	}

	postCreate() {
		for (let key in this.properties) {
			this.onUpdate(key, this.properties[key], true);
		}		
	}

	resetAnimation(time) {
		const t = time || this.engine.lastTime;
		this.updated.animation = t;
		this.updated.updateTime = t;
	}

	getCenterX(time) {
		const box = this.getCollisionBox(time);
		return (box.left + box.right) / 2;
	}

	getCenterY(time) {
		const box = this.getCollisionBox(time);
		return (box.top + box.bottom) / 2;
	}

	getCollisionBox(time) {
		if (!this.collisionBox.dirty) {
			return this.collisionBox;
		}
		const frame = this.getAnimationFrame(time);
		if (this.collisionBox.frame === frame && !this.collisionBox.dirty) {
			return this.collisionBox;
		}
		this.collisionBox.frame = frame;
		const rect = this.anim.getCollisionBoxNormalized(frame);
		if (!rect) {
			return null;
		}
		this.calculateCollisonBox(rect);
		return this.collisionBox;
	}

	recalculatePosition(time) {
		const t = time || this.engine.lastTime;
		if (this.updated.motion !== t) {
			const dt = (t - this.updated.motion) / 1000;
			const x = this.x + dt * this.motion[0] + .5 * dt * dt * this.acceleration[0];
			const y = this.y + dt * this.motion[1] + .5 * dt * dt * this.acceleration[1];
			const z = this.z + dt * this.motion[2] + .5 * dt * dt * this.acceleration[2];
			this.changePosition(x, y, z, t);
			this.updated.motion = t;
		}
	}

	calculateCollisonBox(rect) {
		const flipH = this.direction < 0;
		const flipV = this.vdirection < 0;
		const rLeft = flipH ? 1 - rect.right : rect.left;
		const rRight = flipH ? 1 - rect.left : rect.right;
		const rTop = flipV ? 1 - rect.bottom : rect.top;
		const rBottom = flipV ? 1 - rect.top : rect.bottom;

		const collisionPadding = this.anim.collisionPadding ?? 0;
		const width = this.size[0];
		const height = this.size[1];
		const left = this.x - this.hotspot[0];
		const top = this.y - this.hotspot[1];
		this.collisionBox.left = left + rLeft * width * this.crop[0] - collisionPadding;
		this.collisionBox.right = left + rRight * width * this.crop[0] + collisionPadding;
		this.collisionBox.top = top + rTop * height * this.crop[1] - collisionPadding;
		this.collisionBox.bottom = top + rBottom * height * this.crop[1] + collisionPadding;
		this.collisionBox.dirty = false;
	}
}