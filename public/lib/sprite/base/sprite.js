//	sprite
//	- x, y, width, height
//	- hotspot
//	- rotation
//	- direction
//	- anim.src
//	- anim (cols, rows, frameRate)


class Sprite {
	constructor(data, time, properties, engine, game) {
		this.data = data;
		this.engine = engine;
		this.game = game;
		this.type = this.constructor.name;
		this.id = data.id;
		this.name = data.name || "";
		this.x = data.x || 0;
		this.y = data.y || 0;
		this.z = data.z || 0;
		this.positionCache = [this.x, this.y, this.z];
		this.size = [... engine.translate(data.size) || [1, 1]];
		this.rotation = [... data.rotation || [0, 0, 0]];
		this.opacity = data.opacity !== undefined ? data.opacity : 1;
		this.light = data.light !== undefined ? data.light : 1;
		this.active = true;
		this.remember = data.remember || false;
		this.motion = [... data.motion || [0, 0, 0]];
		this.acceleration = [... data.acceleration || [0, 0, 0]];
		this.spriteType = engine.translate(data.spriteType) || 0;

		this.direction = data.direction || 1;
		this.ydirection = data.ydirection || 1;
		this.anim = data.anim;
		if (!this.anim) {
			console.error("Anim doesn't exist.");
		}

		this.collisionBox = new CollisionBox(this, data.collisionFrame);
		if (data.collisionFrame?.show) {
			this.collisionBox.show();
		}
		this.properties = properties || {};
		this.onChange = {
			position: (self, {x, y, z}) => {
				self.changePosition(x, y, z);
			},
		};
		this.followers = new Set();

		this.updated = {
			sprite: time,
			spriteSheet: time,
			animation: time,
			updateTime: time,
			motionTime: time,
			direction: time,
			opacity: time,
			motion: time,
			acceleration: time,
			light: time,
			spriteType: time,
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
		const frameOffset = anim.firstFrame - anim.startFrame;
		return updated.animation - frameOffset * anim.frameDuration;
	}

	getAnimationFrame(time) {
		const { anim, updated } = this;
		const animationElapsed = (time || this.engine.lastTime) - updated.animation;
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
			this.collisionBox.dirty = true;
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
			this.collisionBox.dirty = true;
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
			this.collisionBox.dirty = true;
			this.needUpdate();
			return true;
		}
		return false;
	}

	changeAnimationTime(animationTime, time) {
		this.updated.updateTime = time || this.engine.lastTime;
		this.updated.animation = animationTime;		
	}

	changeSpriteType(spriteType, time) {
		const actualSpriteType = this.engine.translate(spriteType) || 0;
		if (this.spriteType !== actualSpriteType) {
			this.spriteType = actualSpriteType;
			this.updated.spriteType = time || this.engine.lastTime;
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
		return this.getCollisionBox(time).centerX;
	}

	getCenterY(time) {
		return this.getCollisionBox(time).centerY;
	}

	getCollisionBox(time) {
		return this.collisionBox.getCollisionBox(time);
	}

	getRealPosition(t) {
		const time = t || this.engine.lastTime;
		const dt = (time - this.updated.motion) / 1000;
		const dt2 = dt * dt;
		this.positionCache[0] = this.x + this.motion[0] * dt + .5 * dt2 * this.acceleration[0];
		this.positionCache[1] = this.y + this.motion[1] * dt + .5 * dt2 * this.acceleration[1];
		this.positionCache[2] = this.z + this.motion[2] * dt + .5 * dt2 * this.acceleration[2];
		return this.positionCache;
	}

	recalculatePosition(t) {
		const time = t || this.engine.lastTime;
		if (this.updated.motion !== time) {
			const dt = (time - this.updated.motion) / 1000;
			const dt2 = dt * dt;
			const position = this.getRealPosition(time);
			const x = position[0];
			const y = position[1];
			const z = position[2];
			const vx = this.motion[0] + dt * this.acceleration[0];
			const vy = this.motion[1] + dt * this.acceleration[1];
			const vz = this.motion[2] + dt * this.acceleration[2];
			this.changePosition(x, y, z, time);
			this.changeMotion(vx, vy, vz, time, true);
			this.updated.motion = time;
		}
	}

	follow(sprite) {
		sprite.followers.add(this);
	}
}