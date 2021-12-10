class TextureManager {
	constructor(gl, uniforms) {
		this.gl = gl;
		this.glTextures = [];
		this.textureSize = 4096;
		this.textureAtlas = [];

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

	createAtlas(index, imageLoader, width, height) {
		const atlas = new TextureAtlas(this.gl, this.glTextures, index, width, height, this.textureSize, imageLoader);
		this.textureAtlas.push(atlas);
		return atlas;
	}

	clear() {
		this.textureAtlas.length = 0;
	}

	generateMipMap(index) {
		const { gl } = this;
		gl.activeTexture(gl[`TEXTURE${index}`]);
		gl.generateMipmap(gl.TEXTURE_2D);
	}

	generateAllMipMaps() {
		let maxIndex = 0;
		this.textureAtlas.forEach(({maxTextureIndex}) => {
			maxIndex = Math.max(maxIndex, maxTextureIndex);
		});
		for (let i = 0; i <= maxIndex; i++) {
			this.generateMipMap(i);
		}
	}
}