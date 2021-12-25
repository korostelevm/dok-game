const {mat2, mat3, mat4, vec2, vec3, vec4, quat} = glMatrix;

class Shader {
	constructor(id, gl, ext, vertexShader, fragmentShader, attributes, maxInstanceCount) {
		this.id = id;
		this.gl = gl;
		this.ext = ext;
		this.attributes = {};
		this.uniforms = {};
		this.vertexShaderCode = vertexShader;
		this.fragmentShaderCode = fragmentShader;
		this.maxInstanceCount = maxInstanceCount;
		this.attributesConfig = attributes;
	}

	link() {
		this.program = this.linkShaders(this.attributesConfig);
	}

	use() {
		this.gl.useProgram(this.program);		
	}

	typeName(type) {
		return type == this.gl.VERTEX_SHADER ? "vertex" : "fragment;"
	}

	initShader(type, source) {
		if (type !== this.gl.VERTEX_SHADER && type !== this.gl.FRAGMENT_SHADER) {
			throw new Error(`Shader error in ${this.typeName(type)}`);
		}
		const shader = this.gl.createShader(type);
		this.gl.shaderSource(shader, source);
		this.gl.compileShader(shader);

		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
		  // Something went wrong during compilation; get the error
		  console.error(`Shader compile error in ${this.typeName(type)}:` + this.gl.getShaderInfoLog(shader));
		}

		return shader;
	}

	linkShaders(attributesConfig) {
		const { vertexShaderCode, fragmentShaderCode, maxInstanceCount } = this;
		const program = this.program = this.gl.createProgram();
		this.assignAttributes(program, attributesConfig, vertexShaderCode);

		const vertexShader = this.initShader(this.gl.VERTEX_SHADER, vertexShaderCode);
		const fragmentShader = this.initShader(this.gl.FRAGMENT_SHADER, fragmentShaderCode);
		this.gl.attachShader(program, vertexShader);
		this.gl.attachShader(program, fragmentShader);
		this.gl.linkProgram(program);
		this.gl.detachShader(program, vertexShader);
		this.gl.detachShader(program, fragmentShader);
		this.gl.deleteShader(vertexShader);
		this.gl.deleteShader(fragmentShader);

		if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
		  throw new Error('Unable to initialize the shader program:\n' + this.gl.getProgramInfoLog(program));
		}

		console.log("shaders linked.");
		this.initShaders(vertexShaderCode, fragmentShaderCode, attributesConfig, maxInstanceCount);
		return program;
	}

	initShaders(vertexShaderCode, fragmentShaderCode, attributesConfig, maxInstanceCount) {
		this.initUniforms(this.program, vertexShaderCode, fragmentShaderCode);
		this.initAttributes(this.program, attributesConfig, vertexShaderCode, maxInstanceCount);
	}

	verifyAttributes(attributesConfig) {
		for (let name in attributesConfig) {
			if (!this.attributes[name]) {
				console.warn(`Configured attribute ${name} does not exist in shaders.`);
			}
		}
	}

	initUniforms(program, vertexShaderCode, fragmentShaderCode) {
		const variables = this.getShaderVariables(vertexShaderCode, fragmentShaderCode).filter(({attributeType}) => attributeType === "uniform");
		variables.forEach(({name, dataType}) => {
			if (this.uniforms[name]) {
				return;
			}
			//	dataType is vec4 / mat4 etc...
			this.uniforms[name] = {
				name,
				location: this.gl.getUniformLocation(program, name),
				shader: this.id,
			};
			this.enableLocations(name, this.uniforms[name].location, dataType);
		});
	}

	assignAttributes(program, attributesConfig, vertexShaderCode) {
		const variables = this.getShaderVariables(vertexShaderCode).filter(({attributeType}) => attributeType === "attribute");
		variables.forEach(({name, dataType}) => {
			if (!attributesConfig[name]) {
				return;
			}
			if (typeof(attributesConfig[name].location) == "number") {
				this.gl.bindAttribLocation(program, location, name);				
			}
		});
	}

	initAttributes(program, attributes, vertexShaderCode, maxInstanceCount) {
		this.clearBuffers();

		const variables = this.getShaderVariables(vertexShaderCode).filter(({attributeType}) => attributeType === "attribute");
		variables.forEach(({name, dataType}) => {
			if (!attributes[name]) {
				console.warn(`Attribute ${name} has no configuration. Update config/webgl/attributes.json`);
				return;
			}
			const location = this.gl.getAttribLocation(program, name);
			this.attributes[name] = this.initializeAttribute(name, dataType, location, attributes[name], maxInstanceCount);
			if (this.attributes[name]) {
				this.enableLocations(name, location, dataType);
			}
		});
		this.verifyAttributes(attributes);
	}

	clearBuffers() {
		for (let name in this.attributes) {
			if (this.attributes[name].buffer) {
				this.gl.deleteBuffer(this.attributes[name].buffer);
				this.attributes[name].buffer = null;
			}
		}
	}

	initializeAttribute(name, dataType, location, attributeConfig, maxInstanceCount) {
		if (location < 0) {
			console.warn(`Attribute ${name} has no location in shader. Perhaps the shader code doesn't use it.`);
			return;
		}

		const { gl, ext, attributes } = this;
		if (!gl[attributeConfig.usage]) {
			console.warn(`Attribute ${name} usage is invalid: ${attributeConfig.usage}.`);
			return;
		}

		const NUM_VERTICES = 6;
		const group = dataType.match(/([a-zA-Z]+)(\d?)/);
		const size = !group || group[2]==="" || isNaN(group[2]) ? 1 : parseInt(group[2]);
		const dataStructure = !group ? "vec" : group[1];
		const numRows = dataStructure === "mat" ? size : 1;
		const glType = gl[attributeConfig.type || "FLOAT"];
		const bytesPerInstance = size * numRows * this.getByteSize(glType);

		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

		for (let i = 0; i < numRows; i++) {
			const offset = i * size * this.getByteSize(glType);
			gl.vertexAttribPointer(
			  location + i,  				// location
			  size,            				// size (num values to pull from buffer per iteration)
			  glType,     					// type of data in buffer
			  attributeConfig.normalize,    // normalize
			  bytesPerInstance,            	// stride (0 = compute from size and type above)
			  offset,            			// offset in buffer
			);
			ext.vertexAttribDivisorANGLE(location + i, attributeConfig.instances || 0);			
		}
		const bufferSize = (attributeConfig.instances ? maxInstanceCount : NUM_VERTICES) * bytesPerInstance;
		gl.bufferData(gl.ARRAY_BUFFER, bufferSize, gl[attributeConfig.usage]);
		//console.log(`Buffer initialized: ${name}(${dataType}) usage:${attributeConfig.usage} => ${bufferSize}`);
		
		return {
			name,
			location,
			buffer,
			bytesPerInstance,
			instances: attributeConfig.instances,
			shader: this.id,
		}
	}

	getTypeArrayClass(bufferType) {
 		const { gl } = this;
 		switch(bufferType) {
 			case gl.BYTE:
				return Int8Array;
 			case gl.UNSIGNED_BYTE:
				return Uint8Array;
			case gl.SHORT:
				return Int16Array;
			case gl.UNSIGNED_SHORT:
				return Uint16Array;
			case gl.INT:
				return Int32Array;
			case gl.UNSIGNED_INT:
				return Uint32Array;
			case gl.FLOAT:
				return Float32Array;
 		}
 		return null;		
	}

 	getByteSize(bufferType) {
 		const typedArrayClass = this.getTypeArrayClass(bufferType);
 		return typedArrayClass == null ? 0 : typedArrayClass.BYTES_PER_ELEMENT;
 	}

	enableLocations(name, loc, dataType) {
		if (loc === null) {
			console.warn(`Location ${name}(${dataType}) does not exist. Perhaps the shader code doesn't use it.`);
			return;
		}
		const group = dataType.match(/mat(\d?)/);
		const size = !group || group[1]==="" || isNaN(group[1]) ? 1 : parseInt(group[1]);

		for (let i = 0; i < size; i++) {
			this.gl.enableVertexAttribArray(loc + i);

			//console.log(`Enabled location ${name}. Type: ${dataType}.`, loc);
		}
	}

	getShaderVariables(...shaders) {
		const variables = [];
		shaders.forEach(shader => {
			const groups = shader.match(/\n(attribute|uniform) ([\w]+) ([\w]+)(\[.+\])?;/g)
				.map(line => line.match(/\n(attribute|uniform) ([\w]+) ([\w]+)(\[.+\])?;/));
			variables.push(... groups.map(([line, attributeType, dataType, name]) => {
				return { line, attributeType, dataType, name };
			}));
		});
		return variables;
	}

	getSupportedExtensions() {
		return this.gl.getSupportedExtensions();		
	}
}
