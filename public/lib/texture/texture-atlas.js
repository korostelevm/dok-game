const MAX_FRAME_COUNT = Number.MAX_SAFE_INTEGER;

class TextureAtlas {
	constructor(textureManager, index, xOffset, yOffset) {
		this.textureManager = textureManager;
		this.index = index || 0;
		this.maxTextureIndex = 0;
		this.x = xOffset || 0;
		this.y = yOffset || 0;
		this.spriteWidth = 0;
		this.spriteHeight = 0;
		this.startIndex = 0;
		this.endIndex = 0;
		this.hotspot = [0, 0];

		this.tempMatrix = new Float32Array([
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0,
		]);
		this.shortVec4 = new Uint16Array(4);
		this.floatVec4 = new Float32Array(4);
		this.canvas = document.createElement("canvas");
	}

	setFullTexture() {
		this.x = 0;
		this.y = 0;
		this.frameRate = 1;
		this.frameRateMultiplier = 1;
		this.cols = 1;
		this.rows = 1;
		this.spriteWidth = this.textureManager.textureSize - 1;
		this.spriteHeight = this.textureManager.textureSize - 1;
		this.startFrame = 0;
		this.endFrame = 0;
		this.maxFrameCount = MAX_FRAME_COUNT;
		this.firstFrame = 0;
		this.direction = 1;
		this.vdirection = 1;
		return this;
	}

	getSpriteImageForFrame(image, frame) {
		if (this.cols === 1 && this.rows === 1) {
			return image;
		}
		const { spriteWidth, spriteHeight } = this;
		const col = frame % this.cols;
		const row = Math.floor(frame / this.cols);
		const canvas = this.canvas;
		canvas.width = spriteWidth;
		canvas.height = spriteHeight;

		const context = canvas.getContext("2d");
		context.imageSmoothingEnabled = false;
		context.drawImage(image, col * spriteWidth, row * spriteHeight, spriteWidth, spriteHeight, 0, 0, spriteWidth, spriteHeight);
		return canvas;
	}

	setImage(animationData, image, textureImage, collisionImage) {
		const { id, url, collision_url, collision_padding, texture_url, texture_alpha, texture_blend, hotspot } = animationData;
		this.id = id;
		this.onUpdateImage(image, animationData);

		const { x, y, spriteWidth, spriteHeight, index } = this;

		for (let frame = this.startFrame; frame <= this.endFrame; frame++) {
			const spriteImage = this.getSpriteImageForFrame(image, frame);
			const blendedImage = texture_url ? this.textureManager.textureMix(spriteImage, textureImage, texture_alpha, texture_blend) : spriteImage;
			if (!blendedImage) {
				continue;
			}

			const col = frame % this.cols;
			const row = Math.floor(frame / this.cols);
			this.textureManager.saveTexture(index, x + col * spriteWidth, y + row * spriteHeight, blendedImage);
		}

		if (collision_url) {
			this.collisionBoxes = this.textureManager.textureEdgeCalculator.calculateCollisionBoxes(collision_url, this.cols, this.rows, collisionImage);
		} else {
			this.collisionBoxes = null;
		}

		this.collisionPadding = collision_padding;
		this.hotspot = hotspot || [0, 0];


		this.canvas.width = 0;
		this.canvas.height = 0;
		return this;
	}

	getCollisionBoxNormalized(frame) {
		return this.collisionBoxes ? this.collisionBoxes[frame] : null;
	}

	onUpdateImage(image, animationData) {
		const spriteSheetWidth = image?.naturalWidth || 0;
		const spriteSheetHeight = image?.naturalHeight || 0;
		const { cols, rows, spriteWidth, spriteHeight, frameRate, maxFrameCount, loop, range, firstFrame, direction, vdirection } = animationData;
		const reverse = range && range[1] < range[0];
		this.frameRate = Math.abs(frameRate || 1);
		this.frameRateMultiplier = reverse ? -1 : 1;
		this.cols = cols || (spriteWidth ? Math.ceil(spriteSheetWidth / spriteWidth) : 1);
		this.rows = rows || (spriteHeight ? Math.ceil(spriteSheetHeight / spriteHeight) : 1);
		this.spriteWidth = spriteWidth || spriteSheetWidth / this.cols;
		this.spriteHeight = spriteHeight || spriteSheetHeight / this.rows;
		this.startFrame = (range ? (reverse ? range[1] : range[0]) : 0) || 0;
		this.endFrame = (range ? (reverse ? range[0] : range[1]) : 0) || this.startFrame;
		this.maxFrameCount = maxFrameCount || (loop ? loop * (this.endFrame - this.startFrame) : MAX_FRAME_COUNT);
		this.firstFrame = Math.max(this.startFrame, Math.min(this.endFrame, firstFrame || this.startFrame));
		this.direction = direction || 1;
		this.vdirection = vdirection || 1;
	}

	getTextureCoordinatesFromRect(x, y, width, height, direction, vdirection) {
		let x0 = x;
		let x1 = x + width;
		if (direction * this.direction < 0) {
			x0 = x + width;
			x1 = x;
		}

		let y0 = y;
		let y1 = y + height;
		if (vdirection * this.vdirection < 0) {
			y0 = y + height;
			y1 = y;
		}

		const tempMatrix = this.tempMatrix;
		tempMatrix[0]  = x0; tempMatrix[1]  = y1;
		tempMatrix[4]  = x1; tempMatrix[5]  = y1;
		tempMatrix[8]  = x0; tempMatrix[9]  = y0;
		tempMatrix[12] = x1; tempMatrix[13] = y0;
		return this.tempMatrix;
	}

	getTextureCoordinates(direction, vdirection) {
		const { x, y, spriteWidth, spriteHeight } = this;
		return this.getTextureCoordinatesFromRect(x, y, spriteWidth, spriteHeight, direction, vdirection);
	}

	getSpritesheetInfo() {
		const shortVec4 = this.shortVec4;
		shortVec4[0] = this.cols;
		shortVec4[1] = this.rows;
		shortVec4[2] = this.hotspot[0] * 1000.;
		shortVec4[3] = this.hotspot[1] * 1000.;
		return shortVec4;
	}

	getAnimationInfo() {
		const floatVec4 = this.floatVec4;
		floatVec4[0] = this.startFrame;
		floatVec4[1] = this.endFrame;
		floatVec4[2] = this.frameRate * this.frameRateMultiplier;
		floatVec4[3] = this.maxFrameCount;
		return floatVec4;
	}

	static flattenAtlases(object, path, array) {
		if (object.url) {	//	is atlas
			array.push({id: path.join("."), ...object});
			return array;
		}
		if (Array.isArray(object)) {
			object.forEach((o, index) => {
				TextureAtlas.flattenAtlases(o, path.concat(index), array);
			});
		} else if (typeof(object) === "object") {
			Object.keys(object).forEach(id => {
				TextureAtlas.flattenAtlases(object[id], path.concat(id), array);
			});
		} else {
			console.warn("What is object? => ", object)
		}
		return array;
	}

	static async makeAtlases(engine, atlasConfig) {
		const flattened = TextureAtlas.flattenAtlases(atlasConfig || {}, [], []);
		const atlases = await Promise.all(flattened.map(config => engine.addTexture(config)));
		const atlas = {};
		atlases.forEach(textureAtlas => {
			const idSplit = textureAtlas.id.split(".");
			let root = atlas, id = idSplit[0];
			for (let i = 1; i < idSplit.length; i++) {
				if (!root[id]) {
					root[id] = {};
				}
				root = root[id];
				id = idSplit[i];
			}
			root[id] = textureAtlas;
			atlas[textureAtlas.id] = textureAtlas;
		});
		return atlas;
	}

	static getAnimFromAtlas(atlas, anim) {
		if (typeof(anim) !== "string") {
			return anim;
		}
		const idSplit = anim.split(".");
		let root = atlas;
		for (let i = 0; i < idSplit.length; i++) {
			root = root[idSplit[i]];
		}
		if (!root) {
			console.warn("Anim doesn't exist: ", anim, " in ", atlas);
		}
		return root;
	}
}