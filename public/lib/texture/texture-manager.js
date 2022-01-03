class TextureManager {
	constructor(gl, uniforms) {
		this.gl = gl;
		this.glTextures = [];
		this.textureSize = 4096;
		this.textureAtlas = [];
		this.maxTextureIndex = 0;
		this.textureCache = {};
		this.nextTextureIndex = 0;

		const maxTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
		this.glTextures = new Array(maxTextureUnits).fill(null).map((a, index) => {
			const glTexture = gl.createTexture();
			const width = 1, height = 1;
			gl.activeTexture(gl[`TEXTURE${index}`]);
			gl.bindTexture(gl.TEXTURE_2D, glTexture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			return { glTexture, width, height };
		});

		if (!uniforms.uTextures) {
			console.error(`Missing uTextures uniforms`);
			return;
		}
		gl.uniform1iv(uniforms.uTextures.location, new Array(maxTextureUnits).fill(null).map((a, index) => index));
	}

	createAtlas(index, imageLoader) {
		const atlas = new TextureAtlas(this, index, imageLoader);
		this.textureAtlas.push(atlas);
		return atlas;
	}

	clear() {
		this.textureAtlas.length = 0;
		this.maxTextureIndex = 0;
		this.textureCache = {};
		this.nextTextureIndex = 0;
	}

	generateMipMap(index) {
		const { gl } = this;
		gl.activeTexture(gl[`TEXTURE${index}`]);
		gl.generateMipmap(gl.TEXTURE_2D);
	}

	generateAllMipMaps() {
		for (let i = 0; i <= this.maxTextureIndex; i++) {
			this.generateMipMap(i);
		}
	}

	saveTexture(index, x, y, canvas) {
		const { gl, glTextures, textureSize } = this;
		this.maxTextureIndex = Math.max(index, this.maxTextureIndex);
		gl.activeTexture(gl[`TEXTURE${index}`]);
		const glTexture = glTextures[index];
		if (glTexture.width < textureSize || glTexture.height < textureSize) {
			gl.bindTexture(gl.TEXTURE_2D, glTexture.glTexture);
			glTexture.width = glTexture.height = textureSize;
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, glTexture.width, glTexture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	  		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	  		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	  		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
		}
		gl.texSubImage2D(gl.TEXTURE_2D, 0, x || 0, y || 0, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
		gl.generateMipmap(gl.TEXTURE_2D);
	}
}