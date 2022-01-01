//	sprite
//	- x, y, width, height
//	- hotspot
//	- rotation
//	- direction
//	- anim.src
//	- anim (cols, rows, frameRate)


class Sprite extends Body {
	constructor(data, time, properties, engine, game) {
		super(data, time, engine);
		this.game = game;
		this.type = this.constructor.name;
		this.name = data.name || "";
		this.id = data.id || data.name;
		this.size = [... engine.translate(data.size) || [1, 1]];
		this.rotation = [... data.rotation || [0, 0, 0]];
		this.opacity = data.opacity !== undefined ? data.opacity : 1;
		this.light = data.light !== undefined ? data.light : 1;
		this.remember = data.remember || false;
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

		this.updated = {
			... this.updated,
			sprite: time,
			spriteSheet: time,
			animation: time,
			updateTime: time,
			direction: time,
			opacity: time,
			acceleration: time,
			light: time,
			spriteType: time,
		};
		this.engine.updater.add(this);

		if (data.shadow) {
			game.spriteFactory.create({
				type: "Shadow",
				sprite: this,
			});
		}
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

	changePosition(x, y, z, time, skipRecalculate) {
		if (super.changePosition(x, y, z, time, skipRecalculate)) {
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
			if (this.shadow) {
				this.shadow.changeDirection(direction, time);
			}
			return true;
		}
		return false;
	}

	changeYDirection(direction, time) {
		if (this.ydirection !== direction) {
			this.ydirection = direction;
			this.updated.direction = time || this.engine.lastTime;
			this.collisionBox.dirty = true;
			this.needUpdate();
			if (this.shadow) {
				this.shadow.changeYDirection(direction, time);
			}
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
			if (this.shadow) {
				this.shadow.changeAnimation(anim, time, updateTime);
			}
			return true;
		}
		return false;
	}

	changeActive(value, time) {
		if (super.changeActive(value, time)) {
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
		if (super.changeMotion(dx, dy, dz, time, skipRecalculate)) {
			this.collisionBox.dirty = true;
			this.needUpdate();
			return true;			
		}
		return false;
	}

	changeAcceleration(ax, ay, az, time) {
		if (super.changeAcceleration(ax, ay, az, time)) {
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
}