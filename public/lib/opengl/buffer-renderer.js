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
		this.size = config.viewport.size;
		this.tempBytes = new Uint8Array(4);
		this.tempSingleByte = new Uint8Array(1);
		this.tempVec3 = vec3.create();
	}

	setAttributeVec2(attribute, index, x, y) {
		this.tempVec2[0] = x;
		this.tempVec2[1] = y;
		this.setAttribute(attribute, index, this.tempVec2);
	}

	setAttributeByte(attribute, index, byte) {
		this.tempSingleByte[0] = byte;
		this.setAttribute(attribute, index, this.tempSingleByte);
	}

	setAttributeByte2(attribute, index, byte0, byte1) {
		this.tempBytes[0] = byte0;
		this.tempBytes[1] = byte1;
		this.setAttribute(attribute, index, this.tempBytes);
	}

	setAttributeByte3(attribute, index, byte0, byte1, byte3) {
		this.tempBytes[0] = byte0;
		this.tempBytes[1] = byte1;
		this.tempBytes[2] = byte3;
		this.setAttribute(attribute, index, this.tempBytes);
	}

	setAttributeByte4(attribute, index, byte0, byte1, byte3, byte4) {
		this.tempBytes[0] = byte0;
		this.tempBytes[1] = byte1;
		this.tempBytes[2] = byte3;
		this.tempBytes[3] = byte4;
		this.setAttribute(attribute, index, this.tempBytes);
	}

	setAttribute(attribute, index, typeArray) {
		if (!attribute) {
			console.warn("No attribute.");
			return;
		}
		const gl = this.gl;
		if (this.lastBoundBuffer !== attribute.buffer) {
			gl.bindBuffer(gl.ARRAY_BUFFER, attribute.buffer);
			this.lastBoundBuffer = attribute.buffer;
		}
		gl.bufferSubData(gl.ARRAY_BUFFER, index * attribute.bytesPerInstance, typeArray);
	}
}