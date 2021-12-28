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
		this.size = [... engine.translate(data.size) || [1, 1, 1]];
		for (let i = 0; i < 3; i++) {
			this.size[i] = this.size[i] || 1;
		}
		this.rotation = [... data.rotation || [0, 0, 0]];
		this.opacity = data.opacity !== undefined ? data.opacity : 1;
		this.light = data.light !== undefined ? data.light : 1;
		this.active = true;
		this.remember = data.remember || false;
		this.motion = [... data.motion || [0, 0, 0]];
		this.acceleration = [... data.acceleration || [0, 0, 0]];
		this.slowdown = data.slowdown ?? 1;
		this.isHud = data.isHud ? 1 : 0;
		this.isSprite = data.isSprite ? 1 : 0;

		this.direction = data.direction || 1;
		this.ydirection = data.ydirection || 1;
		this.anim = data.anim;
		if (!this.anim) {
			console.warn("Anim doesn't exist.");
		}
		this.collisionBox = {
			top:0,
			left:0,
			bottom:0,
			right:0,
			close:0,
			far:0,
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
			isFlag: time,
			motion: time,
			acceleration: time,
			light: time,
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

	changeSize(width, height, depth, time) {
		if (this.size[0] !== width || this.size[1] !== height || this.size[2] !== depth) {
			this.size[0] = width;
			this.size[1] = height;
			this.size[2] = depth;
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
			this.updated.isFlag = time || this.engine.lastTime;
			this.needUpdate();
			return true;
		}
		return false;
	}

	changeSprite(isSprite, time) {
		if (this.isSprite !== isSprite) {
			this.isSprite = isSprite;
			this.updated.isFlag = time || this.engine.lastTime;
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

	changeYDirection(ydirection, time) {
		if (this.ydirection !== ydirection) {
			this.ydirection = ydirection;
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

	changeActive(value, time) {
		if (this.active !== value) {
			this.active = value;
			this.updated.active = time || this.engine.lastTime;
			this.needUpdate();
			return true;
		}
		return false;
	}

	changeLight(light, time) {
		if (this.light !== light) {
			this.light = light;
			this.updated.light = time || this.engine.lastTime;
			this.needUpdate();
			return true;
		}
		return false;
	}

	changeMotion(dx, dy, dz, time, skipRecalculate) {
		if (this.motion[0] !== dx || this.motion[1] !== dy || this.motion[2] !== dz) {
			if (!skipRecalculate) {
				this.recalculatePosition(time || this.engine.lastTime);
			}
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

	changeSlowdown(slowdown, time) {
		if (this.slowdown !== slowdown) {
			this.recalculatePosition(time);
			this.slowdown = slowdown;
			this.updated.motion = time || this.engine.lastTime;
			this.needUpdate();
			return true;			
		}
	}

	changeAnimationTime(animationTime, time) {
		this.updated.updateTime = time || this.engine.lastTime;
		this.updated.animation = animationTime;		
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
			const dt2 = dt * dt;
			const x = this.x + this.motion[0] * dt + .5 * dt2 * this.acceleration[0];
			const y = this.y + this.motion[1] * dt + .5 * dt2 * this.acceleration[1];
			const z = this.z + this.motion[2] * dt + .5 * dt2 * this.acceleration[2];
			const vx = this.motion[0] + dt * this.acceleration[0];
			const vy = this.motion[1] + dt * this.acceleration[1];
			const vz = this.motion[2] + dt * this.acceleration[2];
			this.changePosition(x, y, z, t);
			this.changeMotion(vx, vy, vz, t, true);
			this.updated.motion = t;
		}
	}

	calculateCollisonBox(rect) {
		const flipX = this.direction < 0;
		const flipY = this.ydirection < 0;
		const flipZ = this.zdirection < 0;
		const rLeft = flipX ? 1 - rect.right : rect.left;
		const rRight = flipX ? 1 - rect.left : rect.right;
		const rTop = flipY ? 1 - rect.bottom : rect.top;
		const rBottom = flipY ? 1 - rect.top : rect.bottom;
		const rClose = rect.close;
		const rFar = rect.far;

		const collisionPadding = this.anim.collisionPadding ?? 0;
		const width = this.size[0];
		const height = this.size[1];
		const depth = this.size[2];
		const left = this.x - this.anim.hotspot[0] * width;
		const top = this.y - this.anim.hotspot[1] * height;
		const close = this.z;
		this.collisionBox.left = left + rLeft * width - collisionPadding;
		this.collisionBox.right = left + rRight * width + collisionPadding;
		this.collisionBox.top = top + rTop * height - collisionPadding;
		this.collisionBox.bottom = top + rBottom * height + collisionPadding;
		this.collisionBox.close = close + rClose * depth;
		this.collisionBox.far = close + rFar * depth;
		this.collisionBox.dirty = false;
	}
}