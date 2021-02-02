const globalData={
	".DS_Store": null,
	"attributes": {
		"vertexPosition": {
			"location": 0,
			"type": "FLOAT",
			"usage": "STATIC_DRAW"
		},
		"position": {
			"type": "FLOAT",
			"usage": "DYNAMIC_DRAW"
		},
		"isPerspective": {
			"instances": 1,
			"type": "UNSIGNED_BYTE",
			"normalize": true,
			"usage": "STATIC_DRAW"
		},
		"colors": {
			"instances": 1,
			"type": "UNSIGNED_BYTE",
			"normalize": true,
			"usage": "DYNAMIC_DRAW"
		},
		"textureIndex": {
			"instances": 1,
			"type": "UNSIGNED_BYTE",
			"usage": "DYNAMIC_DRAW"
		},
		"textureCoordinates": {
			"instances": 1,
			"type": "UNSIGNED_SHORT",
			"usage": "DYNAMIC_DRAW"
		},
		"matrix": {
			"instances": 1,
			"type": "FLOAT",
			"usage": "DYNAMIC_DRAW"
		}
	},
	"fragmentShader": "precision mediump float;\n\nconst int NUM_TEXTURES = 16;\n\nuniform float time;\nuniform sampler2D uTextures[NUM_TEXTURES];\n\n// varying vec4 v_color;\nvarying vec2 v_textureCoord;\nvarying float v_index;\n\nvec4 getTextureColor(sampler2D textures[NUM_TEXTURES], float textureSlot, vec2 vTexturePoint) {\n    float threshold = 0.00001;\n    for (int i = 0; i < NUM_TEXTURES; ++i) {\n        if (abs(float(i) - textureSlot) < threshold) {\n            return texture2D(textures[i], vTexturePoint);\n        }\n    }\n    return texture2D(textures[0], vTexturePoint);\n}\n\nvoid main() {\n    // gl_FragColor = vec4(1.,\n    //     gl_FragCoord.x / 512. + sin(time / 1000.),\n    //     gl_FragCoord.y / 512. + cos(time / 1000.),\n    //     .5);\n    gl_FragColor = getTextureColor(uTextures, v_index, v_textureCoord.xy);\n}\n",
	"vertexShader": "precision mediump float;\n\nattribute vec2 vertexPosition;\n// attribute mat4 colors;\n// attribute mat4 matrix;\n// attribute float isPerspective;\nattribute vec2 position;\nattribute float textureIndex;\nattribute mat4 textureCoordinates;\n\nuniform float time;\n// uniform mat4 perspective;\n// uniform mat4 ortho;\n// uniform mat4 view;\n\n// varying vec4 v_color;\nvarying vec2 v_textureCoord;\nvarying float v_index;\n\nvec4 getCornerValue(mat4 value, vec2 position) {\n    return mix(\n        mix(value[0], value[1], position.x * .5 + .5), \n        mix(value[2], value[3], position.x * .5 + .5),\n        position.y * .5 + .5);    \n}\n\nvoid main() {\n    // float vIsPerspective = (sin(time / 1000.) + 1.) * .5 * isPerspective;\n    // mat4 projection = vIsPerspective * perspective + (1. - vIsPerspective) * ortho;\n    // // Multiply the position by the matrix.\n    // gl_Position = projection * view * (vec4(position, 0) + matrix * vec4(vertexPosition, 0, 1.));\n    // v_color = getCornerValue(colors, vertexPosition);\n    vec4 textureInfo = getCornerValue(textureCoordinates, vertexPosition);\n    v_textureCoord = textureInfo.xy / 4096.;\n    v_index = textureIndex;\n\n    gl_Position = vec4(position.xy, 0, 1.);\n}\n"
};