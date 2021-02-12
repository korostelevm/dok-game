class TextureAtlas {
	constructor(gl, glTextures, index, x, y, width, height, textureSize, imageLoader) {
		this.gl = gl;
		this.glTextures = glTextures;
		this.index = index || 0;
		this.x = x || 0;
		this.y = y || 0;
		this.width = width || 0;
		this.height = height || 0;
		this.textureSize = textureSize;
		this.canvas = document.createElement("canvas");
		this.imageLoader = imageLoader;
		this.startTime = 0;
		this.spriteWidth = 0;
		this.spriteHeight = 0;

		this.tempMatrix = new Uint16Array([
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0,
		]);
		this.tempVec4 = new Float32Array(4);
		this.tempObj = {};
	}

	async setImage(url, time, animationData) {
		const image = await this.imageLoader.loadImage(url);
		const { gl, glTextures, textureSize, index, x, y, canvas } = this;
		canvas.width = this.width || image.naturalWidth;
		canvas.height = this.height || image.naturalHeight;
		const context = canvas.getContext("2d");
		context.imageSmoothingEnabled = false;
		context.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, canvas.width, canvas.height);

		const glTexture = glTextures[index];
		gl.activeTexture(gl[`TEXTURE${index}`]);
		gl.bindTexture(gl.TEXTURE_2D, glTexture.glTexture);
		if (glTexture.width < textureSize || glTexture.height < textureSize) {
			glTexture.width = glTexture.height = textureSize;
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, glTexture.width, glTexture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		}
		gl.texSubImage2D(gl.TEXTURE_2D, 0, x || 0, y || 0, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
		gl.generateMipmap(gl.TEXTURE_2D);
		this.onUpdateImage(image, time, animationData || this.tempObj);
		return this;
	}

	onUpdateImage(image, time, animationData) {
		this.startTime = time;
		this.spriteSheetWidth = this.width || (image ? image.naturalWidth : 0);
		this.spriteSheetHeight = this.width || (image ? image.naturalHeight : 0);
		const { cols, rows, frameRate, totalFrames } = animationData;
		this.frameRate = frameRate || 0;
		this.cols = cols || 1;
		this.rows = rows || 1;
		this.totalFrames = totalFrames || (this.cols * this.rows);
		this.spriteWidth = this.spriteSheetWidth / this.cols;
		this.spriteHeight = this.spriteSheetHeight / this.rows;
	}

	getTextureCoordinatesFromRect(x, y, width, height, index, direction, opacity) {
		let x0 = x;
		let x1 = x + width;
		if (direction < 0) {
			x0 = x + width;
			x1 = x;
		}

		const { tempMatrix } = this;
		tempMatrix[0]  = x0; tempMatrix[1]  = y + height;
		tempMatrix[4]  = x1; tempMatrix[5]  = y + height;
		tempMatrix[8]  = x0; tempMatrix[9]  = y;
		tempMatrix[12] = x1; tempMatrix[13] = y;

		tempMatrix[2] = tempMatrix[6] = tempMatrix[10] = tempMatrix[14] = opacity * 100;
		return this.tempMatrix;
	}

	getTextureCoordinates(direction, opacity) {
		const { x, y, index } = this;
		const { spriteWidth, spriteHeight } = this;

		return this.getTextureCoordinatesFromRect(x, y, spriteWidth, spriteHeight, index, direction, opacity);
	}

	getAnimationInfo(time) {
		const { tempVec4 } = this;
		tempVec4[0] = this.cols;
		tempVec4[1] = this.totalFrames;
		tempVec4[2] = this.frameRate;
		tempVec4[3] = time;
		return tempVec4;
	}
}