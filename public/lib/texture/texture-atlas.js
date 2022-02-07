const MAX_FRAME_COUNT = Number.MAX_SAFE_INTEGER;

class TextureAtlas {
	constructor(textureManager, index, imageLoader, textureEdgeCalculator) {
		this.textureManager = textureManager;
		this.textureEdgeCalculator = textureEdgeCalculator;
		this.index = index || 0;
		this.maxTextureIndex = 0;
		this.x = 0;
		this.y = 0;
		this.imageLoader = imageLoader;
		this.spriteWidth = 0;
		this.spriteHeight = 0;
		this.startIndex = 0;
		this.endIndex = 0;

		this.tempMatrix = new Float32Array([
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0,
		]);
		this.shortVec4 = new Uint16Array(4);
		this.floatVec4 = new Float32Array(4);
		this.canvas = textureManager.canvas;
	}

	textureMix(image, texture, texture_alpha, texture_blend) {
		const canvas = this.canvas;
		const context = canvas.getContext("2d");
		if (canvas !== image) {
			this.getCanvasImage(image, canvas);
		}
		context.globalCompositeOperation = texture_blend || "source-atop";
		context.globalAlpha = texture_alpha || .5;

		const scale = Math.max(1, Math.max((image.naturalWidth || image.width) / texture.naturalWidth, (image.naturalHeight || image.height) / texture.naturalHeight));
		context.drawImage(texture, 0, 0, texture.naturalWidth, texture.naturalHeight, 0, 0, texture.naturalWidth * scale, texture.naturalHeight * scale);

		context.globalCompositeOperation = "";
		context.globalAlpha = 1;
		return canvas;
	}

	getCanvasImage(image, canvas) {
		const sourceWidth = image.naturalWidth || image.width;
		const sourceHeight = image.naturalHeight || image.height;
		canvas.width = sourceWidth;
		canvas.height = sourceHeight;

		const context = canvas.getContext("2d");
		context.imageSmoothingEnabled = false;
		context.drawImage(image, 0, 0, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
		return canvas;
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

	async setImage(animationData) {
		const { id, url, collision_url, collision_padding, texture_url, texture_alpha, texture_blend, hotspot } = animationData;
		const [image, textureImage] = await Promise.all([url,texture_url].map(u => this.imageLoader.loadImage(u)));
		this.id = id;
		this.onUpdateImage(image, animationData || {});

		const { x, y, spriteWidth, spriteHeight, index } = this;

		const tag = `${url}-${collision_url||""}-${collision_padding||""}-${texture_url||""}-${texture_alpha||""}-${texture_blend||""}-${x},${y}-${spriteWidth},${spriteHeight}-${index}-${this.startFrame}-${this.endFrame}`;
		//	check tag to avoid duplicate loads

		for (let frame = this.startFrame; frame <= this.endFrame; frame++) {
			const spriteImage = this.getSpriteImageForFrame(image, frame);
			const blendedImage = texture_url ? this.textureMix(spriteImage, textureImage, texture_alpha, texture_blend) : spriteImage;
			if (!blendedImage) {
				continue;
			}

			const col = frame % this.cols;
			const row = Math.floor(frame / this.cols);
			this.textureManager.saveTexture(index, x + col * spriteWidth, y + row * spriteHeight, blendedImage);
		}

		if (collision_url) {
			this.collisionBoxes = await this.textureEdgeCalculator.calculateCollisionBoxes(collision_url, this, this.imageLoader);
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
		this.spriteSheetWidth = image ? image.naturalWidth : 0;
		this.spriteSheetHeight = image ? image.naturalHeight : 0;
		const { cols, rows, spriteWidth, spriteHeight, frameRate, maxFrameCount, loop, range, firstFrame, direction, vdirection } = animationData;
		const reverse = range && range[1] < range[0];
		this.frameRate = Math.abs(frameRate) || 1;
		this.frameRateMultiplier = reverse ? -1 : 1;
		this.frameDuration = 1000 / this.frameRate;
		this.cols = cols || (spriteWidth ? Math.ceil(this.spriteSheetWidth / spriteWidth) : 1);
		this.rows = rows || (spriteHeight ? Math.ceil(this.spriteSheetHeight / spriteHeight) : 1);
		this.spriteWidth = spriteWidth || this.spriteSheetWidth / this.cols;
		this.spriteHeight = spriteHeight || this.spriteSheetHeight / this.rows;
		this.startFrame = (range ? (reverse ? range[1] : range[0]) : 0) || 0;
		this.endFrame = (range ? (reverse ? range[0] : range[1]) : 0) || this.startFrame;
		this.maxFrameCount = maxFrameCount || (loop ? loop * (this.endFrame - this.startFrame) : MAX_FRAME_COUNT);
		this.animated = this.startFrame !== this.endFrame;
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

	getHotSpot() {
		return this.hotspot;
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