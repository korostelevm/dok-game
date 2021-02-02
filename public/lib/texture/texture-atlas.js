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

		this.info = {
			image: null,
			animationData: null,
		};
	}

	async setImage(url, animationData) {
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
		this.info.image = image;
		this.info.animationData = animationData;
		return this;
	}

	getTextureCoordinates(x, y, width, height, index, direction) {
		let x0 = x;
		let x1 = x + width;
		if (direction < 0) {
			x0 = x + width;
			x1 = x;
		}

		return new Uint16Array([
			x0, y + height, index, 0,
			x1, y + height, index, 0,
			x0, y, index, 0,
			x1, y, index, 0,
		]);		
	}

	getTextureCoordinatesAtTime(time, direction) {
		const { x, y, info: {image, animationData}, index } = this;
		const width = this.width || (image ? image.naturalWidth : 0);
		const height = this.height || (image ? image.naturalHeight : 0);

		if (animationData) {
			const { cols, rows, frameRate, totalFrames } = animationData;
			const framePeriod = 1000 / (frameRate || 1);
			const frame = Math.floor(time / framePeriod) % (totalFrames || (cols * rows));
			const col = frame % (cols || 1);
			const row = Math.floor(frame / (cols || 1));
			const spriteWidth = width / (cols || 1);
			const spriteHeight = height / (rows || 1);
			return this.getTextureCoordinates(x + col * spriteWidth, y + row * spriteHeight, spriteWidth, spriteHeight, index, direction);
		}
		return this.getTextureCoordinates(x, y, width, height, index, direction);
	}
}