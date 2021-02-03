class BufferRenderer {
	constructor(gl, config) {
		this.gl = gl;
		this.lastBoundBuffer = null;
		this.config = config;
		this.tempVertices = new Float32Array(Utils.makeVertexArray(
		    [ 0, 0 ],
		    [ 0, 0 ],
		    [ 0, 0 ],
		    [ 0, 0 ],
		));
		this.tempSingleByte = new Uint8Array([0]);
	}

	setAttributeByte(attribute, index, byte) {
		this.tempSingleByte[0] = byte;
		this.setAttribute(attribute, index, this.tempSingleByte);
	}

	setAttributeSprite(attribute, index, x, y, width, height) {
		const typeArray = Utils.makeSpriteCoordinatesAtCenter(this.config, x, y, width, height, this.tempVertices);
		this.setAttribute(attribute, index, typeArray);
	}

	setAttribute(attribute, index, typeArray) {
		if (!attribute) {
			console.warn("No attribute.");
			return;
		}
		const { gl } = this;
		if (this.lastBoundBuffer !== attribute.buffer) {
			gl.bindBuffer(gl.ARRAY_BUFFER, attribute.buffer);
			this.lastBoundBuffer = attribute.buffer;
//			console.log(`Bound ${attribute.name}`, attribute);
		}
		gl.bufferSubData(gl.ARRAY_BUFFER, index * attribute.bytesPerInstance, typeArray);
	}
}