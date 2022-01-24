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
		this.size = [... data.size || [1, 1]];
		this.rotation = [... data.rotation || [0, 0, 0]];
		this.opacity = data.opacity !== undefined ? data.opacity : 1;
		this.light = data.light !== undefined ? data.light : 1;
		this.remember = data.remember || false;
		this.spriteType = Constants.SPRITE_TYPES[data.spriteType] || data.spriteType;

		this.direction = data.direction || 1;
		this.ydirection = data.ydirection || 1;
		this.anim = typeof(data.anim) === "string" ? SpriteCollection.fetchAnim(game.atlas, data.anim) : data.anim;

		if (!this.anim) {
			console.error("Anim doesn't exist.");
		}

		this.collisionBox = new CollisionBox(this, data.collisionFrame, data.showCollisionBox);
		this.properties = properties || {};
		this.onChange = {
			position: !this.remember ? null : (self, {x, y, z}) => self.changePosition(x, y, z),
		};

		this.updated = {
			... this.updated,
			animation: time,
		};
		this.engine.updater.add(this);

		if (data.shadow) {
			game.spriteFactory.create({
				type: "Shadow",
				sprite: this,
			});
		}

		this.aux = [];
		for (let name in data.aux) {
			const classObj = nameToClass(name);
			const auxiliary = new classObj(data.aux[name]);
			this.aux.push(auxiliary);
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
		const anim = this.anim;
		const frameOffset = anim.firstFrame - anim.startFrame;
		return this.updated.animation - frameOffset * anim.frameDuration;
	}

	getAnimationFrame(t) {
		const time = t || this.engine.lastTime;
		const anim = this.anim;
		const updated = this.updated;
		const animationElapsed = time - updated.animation;
		const framesElapsed = Math.floor(animationElapsed / anim.frameDuration);
		const frameOffset = anim.firstFrame - anim.startFrame;
		const frameCount = (anim.endFrame - anim.firstFrame) + 1;
		const currentFrame = anim.startFrame + (frameOffset + framesElapsed) % frameCount;
		return currentFrame;
	}

	changePosition(x, y, z, time, skipRecalculate) {
		if (super.changePosition(x, y, z, time, skipRecalculate)) {
			this.updateFlag |= Constants.UPDATE_FLAG.SPRITE;
			this.collisionBox.dirty = true;
			this.needUpdate();			
			return true;
		}
		return false;
	}

	changeSize(width, height) {
		if (this.size[0] !== width || this.size[1] !== height) {
			this.size[0] = width;
			this.size[1] = height;
			this.updateFlag |= Constants.UPDATE_FLAG.SPRITE;
			this.collisionBox.dirty = true;
			this.needUpdate();
			return true;
		}
		return false;
	}

	changeRotation(rotX, rotY, rotZ) {
		if (this.rotation[0] !== rotX || this.rotation[1] !== rotY || this.rotation[2] !== rotZ) {
			this.rotation[0] = rotX;
			this.rotation[1] = rotY;
			this.rotation[2] = rotZ;
			this.updateFlag |= Constants.UPDATE_FLAG.SPRITE;
			this.collisionBox.dirty = true;
			this.needUpdate();
			return true;
		}
		return false;
	}

	changeOpacity(opacity) {
		if (this.opacity !== opacity) {
			this.opacity = opacity;
			this.updateFlag |= Constants.UPDATE_FLAG.OPACITY;
			this.needUpdate();
			return true;
		}
		return false;
	}

	changeDirection(direction) {
		if (this.direction !== direction) {
			this.direction = direction;
			this.updateFlag |= Constants.UPDATE_FLAG.DIRECTION;
			this.collisionBox.dirty = true;
			this.needUpdate();
			if (this.shadow) {
				this.shadow.changeDirection(direction);
			}
			return true;
		}
		return false;
	}

	changeYDirection(direction) {
		if (this.ydirection !== direction) {
			this.ydirection = direction;
			this.updateFlag |= Constants.UPDATE_FLAG.DIRECTION;
			this.collisionBox.dirty = true;
			this.needUpdate();
			if (this.shadow) {
				this.shadow.changeYDirection(direction);
			}
			return true;
		}
		return false;
	}

	changeAnimation(anim) {
		if (this.anim !== anim) {
			if (!anim) {
				console.warn("anim is null.");
				return false;
			}
			this.anim = typeof(anim) === "string" ? SpriteCollection.fetchAnim(this.game.atlas, anim) : anim;
			this.updateFlag |= Constants.UPDATE_FLAG.ANIMATION;
			this.collisionBox.dirty = true;
			this.changeAnimationTime(this.engine.lastTime);
			this.needUpdate();
			if (this.shadow) {
				this.shadow.changeAnimation(anim);
			}
			return true;
		}
		return false;
	}

	changeActive(value) {
		if (super.changeActive(value)) {
			this.needUpdate();
			this.collisionBox.dirty = true;
			return true;
		}
		return false;
	}

	changeLight(light) {
		if (this.light !== light) {
			this.light = light;
			this.updateFlag |= Constants.UPDATE_FLAG.LIGHT;
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

	changeAcceleration(ax, ay, az) {
		if (super.changeAcceleration(ax, ay, az)) {
			this.collisionBox.dirty = true;
			this.needUpdate();
			return true;			
		}
		return false;
	}

	changeAnimationTime(animationTime) {
		if (animationTime !== this.updated.animation) {
			this.updated.animation = animationTime;		
			this.updateFlag |= Constants.UPDATE_FLAG.UPDATE_TIME | Constants.UPDATE_FLAG.ANIMATION;
			this.needUpdate();
			return true;
		}
		return false;
	}

	changeSpriteType(spriteType) {
		const actualSpriteType = Constants.SPRITE_TYPES[spriteType] || spriteType;
		if (this.spriteType !== actualSpriteType) {
			this.spriteType = actualSpriteType;
			this.updateFlag |= Constants.UPDATE_FLAG.SPRITE_TYPE;
			this.needUpdate();
			return true;
		}
		return false;
	}

	needUpdate() {
		this.engine.updater.add(this);
	}

	postCreate() {
		this.aux.forEach(auxiliary => auxiliary.decorate(this));
		for (let key in this.properties) {
			this.onUpdate(key, this.properties[key], true);
		}		
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