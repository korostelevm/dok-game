const globalData={
	".DS_Store": null,
	"attributes": {
		"vertexPosition": {
			"location": 0,
			"type": "FLOAT",
			"usage": "STATIC_DRAW"
		},
		"matrix": {
			"type": "FLOAT",
			"usage": "DYNAMIC_DRAW",
			"instances": 1
		},
		"textureIndex": {
			"type": "UNSIGNED_BYTE",
			"usage": "DYNAMIC_DRAW",
			"instances": 1
		},
		"textureCoordinates": {
			"type": "UNSIGNED_SHORT",
			"usage": "DYNAMIC_DRAW",
			"instances": 1
		},
		"spriteSheet": {
			"type": "UNSIGNED_SHORT",
			"usage": "DYNAMIC_DRAW",
			"instances": 1
		},
		"animationInfo": {
			"type": "FLOAT",
			"usage": "DYNAMIC_DRAW",
			"instances": 1
		}
	},
	"config": {
		"viewport": {
			"pixelScale": 2,
			"size": [
				800,
				400
			]
		},
		"webgl": {
			"antialias": true,
			"preserveDrawingBuffer": false,
			"alpha": false,
			"depth": true,
			"stencil": false,
			"desynchronized": true,
			"premultipliedAlpha": true
		},
		"newgrounds": {
			"key": "",
			"secret": ""
		}
	},
	"fragmentShader": "precision mediump float;\n\nconst int NUM_TEXTURES = 16;\n\nuniform sampler2D uTextures[NUM_TEXTURES];\n\nvarying vec2 v_textureCoord;\nvarying float v_index;\nvarying float v_opacity;\n\nvec4 getTextureColor(sampler2D textures[NUM_TEXTURES], float textureSlot, vec2 vTexturePoint) {\n    float threshold = 0.00001;\n    for (int i = 0; i < NUM_TEXTURES; ++i) {\n        if (abs(float(i) - textureSlot) < threshold) {\n            return texture2D(textures[i], vTexturePoint);\n        }\n    }\n    return texture2D(textures[0], vTexturePoint);\n}\n\nvoid main() {\n    vec4 color = getTextureColor(uTextures, v_index, v_textureCoord);\n    // color = mix(color, vec4(1., 0., 0., 1.), .2);\n    gl_FragColor = vec4(color.xyz, color.w * v_opacity);\n}\n",
	"vertexShader": "precision mediump float;\n\nattribute vec2 vertexPosition;\n// attribute mat4 colors;\nattribute mat4 matrix;\n// attribute float isPerspective;\nattribute vec2 position;\nattribute float textureIndex;\nattribute mat4 textureCoordinates;\nattribute vec4 animationInfo;\nattribute vec4 spriteSheet;\n\nuniform float time;\n// uniform mat4 perspective;\nuniform mat4 ortho;\nuniform mat4 view;\n\n// varying vec4 v_color;\nvarying vec2 v_textureCoord;\nvarying float v_index;\nvarying float v_opacity;\n\nvec4 getCornerValue(mat4 value, vec2 position) {\n    return mix(\n        mix(value[0], value[1], position.x * .5 + .5), \n        mix(value[2], value[3], position.x * .5 + .5),\n        position.y * .5 + .5);    \n}\n\nfloat modPlus(float a, float b) {\n    return mod(a + .4, b);\n}\n\nvec2 getTextureShift(vec4 spriteSheet, vec4 animationInfo, mat4 textureCoordinates) {\n    float animCols = animationInfo[0];\n    float animTotalFrames = animationInfo[1];\n    if (animCols == 0. || animTotalFrames == 0.) {\n        return vec2(0, 0);\n    }\n    float framePerSeconds = animationInfo[2];\n    float animShift = animationInfo[3];\n    float globalFrame = floor((time + animShift) * framePerSeconds / 1000.);\n    float frame = modPlus(globalFrame, abs(animTotalFrames));\n    float row = floor(frame / animCols);\n    float col = floor(frame - row * animCols);\n\n    vec2 cell = vec2(col, row);\n    vec2 spriteRect = abs(textureCoordinates[0].xy - textureCoordinates[3].xy);\n    return cell * spriteRect;\n}\n\nvoid main() {\n    // float vIsPerspective = (sin(time / 1000.) + 1.) * .5 * isPerspective;\n    // mat4 projection = vIsPerspective * perspective + (1. - vIsPerspective) * ortho;\n    // // Multiply the position by the matrix.\n    // gl_Position = projection * view * (vec4(position, 0) + matrix * vec4(vertexPosition, 0, 1.));\n    // v_color = getCornerValue(colors, vertexPosition);\n    vec4 textureInfo = getCornerValue(textureCoordinates, vertexPosition);\n    // vec4 animInfo = vec4(2., 4., 24., 0.);//animationInfo;\n    vec2 textureShift = getTextureShift(spriteSheet, animationInfo, textureCoordinates);\n    v_textureCoord = (textureInfo.xy + textureShift) / 4096.;\n    v_index = textureIndex;\n    v_opacity = textureInfo.z / 100.;\n\n    gl_Position = ortho * view * matrix * vec4(vertexPosition.xy, 0, 1.);\n}\n"
};