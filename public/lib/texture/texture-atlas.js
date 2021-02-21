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
		this.spriteWidth = 0;
		this.spriteHeight = 0;
		this.startIndex = 0;
		this.endIndex = 0;

		this.tempMatrix = new Uint16Array([
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0,
		]);
		this.shortVec4 = new Uint16Array(4);
		this.floatVec4 = new Float32Array(4);
	}

	async setImage(animationData) {
		const { url, collision_url } = animationData;
		const image = await this.imageLoader.loadImage(url);
		const { gl, glTextures, textureSize, index, x, y, canvas } = this;
		canvas.width = this.width || image.naturalWidth;
		canvas.height = this.height || image.naturalHeight;

		const context = canvas.getContext("2d");
		context.imageSmoothingEnabled = false;
		context.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, canvas.width, canvas.height);


		// const cols = animationData.cols || 1;
		// const rows = animationData.rows || 1;
		// const totalFrames = cols * rows;
		// context.font = "10px Arial";
		// for (let i = 0; i < totalFrames; i++) {
		// 	context.fillText("" + i,
		// 		(i % cols) * canvas.width / cols + 10,
		// 		Math.floor(i / cols) * canvas.height / rows + 20);
		// }
		// console.log(cols, rows, totalFrames);
		// canvas.style.position = "absolute";
		// canvas.style.left = "0px"
		// canvas.style.top = "0px"
//		document.body.appendChild(canvas);


		this.saveTexture(gl, glTextures, index, textureSize, x, y, canvas);
		this.onUpdateImage(image, animationData || {});

		this.collisionBoxes = [];
		if (collision_url) {
			context.clearRect(0, 0, canvas.width, canvas.height);
			const collisionImage = await this.imageLoader.loadImage(collision_url);
			context.drawImage(collisionImage, 0, 0, collisionImage.naturalWidth, collisionImage.naturalHeight, 0, 0, canvas.width, canvas.height);

			for (let row = 0; row < this.rows; row++) {
				for (let col = 0; col < this.cols; col++) {
					const cellWidth = canvas.width / this.cols;
					const cellHeight = canvas.height / this.rows;
					const cellX = col * cellWidth;
					const cellY = row * cellHeight;
					const top = this.getTop(context, cellX, cellY, cellWidth, cellHeight);
					const bottom = this.getBottom(context, cellX, cellY, cellWidth, cellHeight);
					const left = this.getLeft(context, cellX, cellY, cellWidth, cellHeight);
					const right = this.getRight(context, cellX, cellY, cellWidth, cellHeight);
					if (top >= 0 && bottom >= 0 && left >= 0 && right >= 0) {
						this.collisionBoxes[row * this.cols + col] = {
							top, left, bottom, right,
						};
					}

//					console.log(url, col, row, "=>", top, bottom, left, right);
				}
			}
		}


		return this;
	}

	getCollisionBox(frame) {
		//console.log(frame, this.collisionBoxes);
		return this.collisionBoxes[frame];
	}

	getTop(context, x, y, width, height) {
		for (let top = 0; top < height; top ++) {
			const pixels = context.getImageData(x, y + top, width, 1).data;
			if (this.hasOpaquePixel(pixels)) {
				return top;
			}
		}
		return -1;
	}

	getBottom(context, x, y, width, height) {
		for (let bottom = height-1; bottom >=0; bottom --) {
			const pixels = context.getImageData(x, y + bottom, width, 1).data;
			if (this.hasOpaquePixel(pixels)) {
				return bottom;
			}
		}
		return -1;
	}

	getLeft(context, x, y, width, height) {
		for (let left = 0; left < width; left ++) {
			const pixels = context.getImageData(x + left, y, 1, height).data;
			if (this.hasOpaquePixel(pixels)) {
				return left;
			}
		}
		return -1;		
	}

	getRight(context, x, y, width, height) {
		for (let right = width-1; right >=0; right--) {
			const pixels = context.getImageData(x + right, y, 1, height).data;
			if (this.hasOpaquePixel(pixels)) {
				return right;
			}
		}
		return -1;
	}

	hasOpaquePixel(pixels) {
		for (let i = 0; i < pixels.length; i+= 4) {
			if (pixels[i + 3]) {
				return true;
			}
		}
		return false;
	}

	saveTexture(gl, glTextures, index, textureSize, x, y, canvas) {
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
	}

	onUpdateImage(image, animationData) {
		this.spriteSheetWidth = this.width || (image ? image.naturalWidth : 0);
		this.spriteSheetHeight = this.width || (image ? image.naturalHeight : 0);
		const { cols, rows, frameRate, range, firstFrame } = animationData;
		this.frameRate = frameRate || 1;
		this.cols = cols || 1;
		this.rows = rows || 1;
		this.spriteWidth = this.spriteSheetWidth / this.cols;
		this.spriteHeight = this.spriteSheetHeight / this.rows;
		this.startFrame = (range ? range[0] : 0) || 0;
		this.endFrame = (range ? range[1] : 0) || this.startFrame;
		this.firstFrame = Math.max(this.startFrame, Math.min(this.endFrame, firstFrame || this.startFrame));
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

		tempMatrix[2] = tempMatrix[6] = tempMatrix[10] = tempMatrix[14] = opacity * 1000;
		return this.tempMatrix;
	}

	getTextureCoordinates(direction, opacity) {
		const { x, y, index, spriteWidth, spriteHeight } = this;
		return this.getTextureCoordinatesFromRect(x, y, spriteWidth, spriteHeight, index, direction, opacity);
	}

	getSpritesheetInfo() {
		const { shortVec4 } = this;
		shortVec4[0] = this.cols;
		shortVec4[1] = this.rows;
		shortVec4[2] = 0;
		shortVec4[3] = 0;
		return shortVec4;
	}

	getAnimationInfo() {
		const { floatVec4 } = this;
		floatVec4[0] = this.startFrame;
		floatVec4[1] = this.endFrame;
		floatVec4[2] = this.frameRate;
		floatVec4[3] = 0;
		return floatVec4;
	}
}