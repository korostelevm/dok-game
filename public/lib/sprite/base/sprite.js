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
		this.vdirection = data.vdirection || 1;
		this.anim = typeof(data.anim) === "string" ? this.getPredefinedTexture(data.anim) || TextureAtlas.getAnimFromAtlas(game.atlas, data.anim) : data.anim;

		this.collisionBox = new CollisionBox(this, data.collisionFrame, data.showCollisionBox);
		this.properties = properties || {};
		this.onChange = {
			position: !this.remember ? null : (self, {x, y, z}) => self.changePosition(x, y, z),
		};

		this.updated = {
			... this.updated,
			animation: data.animationTime ?? time,
		};
		this.engine.updater.add(this);

		if (data.shadow) {
			game.spriteFactory.create({
				type: "Shadow",
				sprite: this,
			});
		}

		if (data.list) {
			if(!game[data.list]) {
				game[data.list] = [];
			}
			game[data.list].push(this);
		}

		this.actionManager = new SpriteActionManager(this);

		this.animationListeners = new Set();

		this.aux = new Map();
		for (let name in data.aux) {
			const classObj = nameToClass(name);
			const auxiliary = new classObj(data.aux[name], this);
			this.aux.set(name, auxiliary);
		}
	}

	getPredefinedTexture(anim) {
		const match = anim.match(/full-texture-([0-9]+)/);
		return match ? this.engine.textureManager.fullTextures[match[1]] : null;
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
		if (!anim) {
			return 0;
		}
		const frameOffset = anim.firstFrame - anim.startFrame;
		return this.updated.animation - frameOffset * 1000 / anim.frameRate;
	}

	getAnimationFrame(t) {
		const time = t || this.engine.time;
		const anim = this.anim;
		const animationSecondsElapsed = (time - this.updated.animation) / 1000;
		const framesElapsed = Math.floor(animationSecondsElapsed * anim.frameRate);
		const frameOffset = anim.firstFrame - anim.startFrame;
		const frameCount = (anim.endFrame - anim.firstFrame) + 1;
		const currentFrame = anim.startFrame + Math.min(anim.maxFrameCount, frameOffset + framesElapsed) % frameCount;
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

	changeVDirection(direction) {
		if (this.vdirection !== direction) {
			this.vdirection = direction;
			this.updateFlag |= Constants.UPDATE_FLAG.DIRECTION;
			this.collisionBox.dirty = true;
			this.needUpdate();
			if (this.shadow) {
				this.shadow.changeVDirection(direction);
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
			this.anim = typeof(anim) === "string" ? TextureAtlas.getAnimFromAtlas(this.game.atlas, anim) : anim;
			this.updateFlag |= Constants.UPDATE_FLAG.ANIMATION;
			this.collisionBox.dirty = true;
			this.changeAnimationTime(this.engine.time);
			this.needUpdate();
			if (this.shadow) {
				this.shadow.changeAnimation(anim);
			}
			for (let listener of this.animationListeners) {
				listener.onAnimation(anim);
			}
			return true;
		}
		return false;
	}

	changeActive(value) {
		if (super.changeActive(value)) {
			this.changeAnimationTime(this.engine.time);
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
		this.aux.forEach(auxiliary => auxiliary.postCreate());
		for (let key in this.properties) {
			this.onUpdate(key, this.properties[key], true);
		}		
	}

	getAuxiliary(name) {
		return this.aux.get(name);
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

	getLoopCount(time) {
		const animationSecondsElapsed = (time - this.updated.animation) / 1000;
		const anim = this.anim;
		const frameCount = (anim.endFrame - anim.firstFrame) + 1;
		return Math.floor(animationSecondsElapsed * anim.frameRate);
	}

	clear() {
		super.clear();
		this.animationListeners.clear();
		this.aux.clear();
	}
}