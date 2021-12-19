const globalData={
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
			"type": "FLOAT",
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
		},
		"updateTime": {
			"type": "FLOAT",
			"usage": "DYNAMIC_DRAW",
			"instances": 1
		},
		"isHud": {
			"type": "UNSIGNED_BYTE",
			"usage": "STATIC_DRAW",
			"instances": 1
		}
	},
	"config": {
		"viewport": {
			"pixelScale": 0.5,
			"size": [
				800,
				400
			]
		},
		"webgl": {
			"antialias": false,
			"preserveDrawingBuffer": false,
			"alpha": false,
			"depth": true,
			"stencil": false,
			"desynchronized": true,
			"premultipliedAlpha": true
		},
		"options": {
			"isPerspective": 1
		},
		"newgrounds": {
			"game": "The Impossible Room",
			"url": "https://www.newgrounds.com/portal/view/823348",
			"key": "53522:zs4SBILE",
			"secret": "jq6s6DaxBvK3Thlr+cZ+bw=="
		},
		"maxInstancesCount": 10000
	},
	"fragmentShader": "precision mediump float;\n\nconst int NUM_TEXTURES = 16;\n\nuniform sampler2D uTextures[NUM_TEXTURES];\nuniform float globalLight;\n\nvarying vec2 v_textureCoord;\nvarying float v_index;\nvarying float v_opacity;\n\nvec4 getTextureColor(sampler2D textures[NUM_TEXTURES], float textureSlot, vec2 vTexturePoint) {\n    float threshold = 0.00001;\n    for (int i = 0; i < NUM_TEXTURES; ++i) {\n        if (abs(float(i) - textureSlot) < threshold) {\n            return texture2D(textures[i], vTexturePoint);\n        }\n    }\n    return texture2D(textures[0], vTexturePoint);\n}\n\nvoid main() {\n    vec4 color = getTextureColor(uTextures, v_index, v_textureCoord);\n    if (color.a <= 0.01) {\n        discard;\n    }\n    gl_FragColor = vec4(color.xyz * globalLight, color.w * v_opacity);\n}\n",
	"vertexShader": "precision mediump float;\n\nconst int START_FRAME_INDEX = 0;\nconst int END_FRAME_INDEX = 1;\nconst int FRAME_RATE_INDEX = 2;\nconst int MAX_FRAME_COUNT_INDEX = 3;\nconst int ANIMATION_UPDATE_INDEX = 0;\n\nattribute vec2 vertexPosition;\n// attribute mat4 colors;\nattribute mat4 matrix;\n// attribute vec2 position;\nattribute float textureIndex;\nattribute mat4 textureCoordinates;\nattribute vec4 animationInfo;\nattribute vec4 spriteSheet;\nattribute vec4 updateTime;\nattribute float isHud;\n\nuniform float isPerspective;\nuniform float time;\nuniform mat4 perspective;\nuniform mat4 ortho;\nuniform mat4 view;\nuniform mat4 hudView;\n\n// varying vec4 v_color;\nvarying vec2 v_textureCoord;\nvarying float v_index;\nvarying float v_opacity;\n\nvec4 getCornerValue(mat4 value, vec2 position) {\n    return mix(\n        mix(value[0], value[1], position.x * .5 + .5), \n        mix(value[2], value[3], position.x * .5 + .5),\n        position.y * .5 + .5);    \n}\n\nfloat modPlus(float a, float b) {\n    return mod(a + .4, b);\n}\n\nvec2 getTextureShift(vec4 spriteSheet, vec4 animInfo, mat4 textureCoordinates) {\n    float animCols = spriteSheet[0];\n    if (animCols == 0.) {\n        return vec2(0, 0);\n    }\n    float animTime = updateTime[ANIMATION_UPDATE_INDEX];\n    vec2 frameRange = vec2(animInfo[START_FRAME_INDEX], animInfo[END_FRAME_INDEX]);\n    float frameCount = max(0., frameRange[1] - frameRange[0]) + 1.;\n\n    float framePerSeconds = animInfo[FRAME_RATE_INDEX];\n    float globalFrame = floor(min(\n        (time - animTime) * framePerSeconds / 1000.,\n        animInfo[MAX_FRAME_COUNT_INDEX] - 1.));\n    float frame = frameRange[0] + modPlus(globalFrame, frameCount);\n    float row = floor(frame / animCols);\n    float col = floor(frame - row * animCols);\n\n    vec2 cell = vec2(col, row);\n    vec2 spriteRect = abs(textureCoordinates[0].xy - textureCoordinates[3].xy);\n    return cell * spriteRect;\n}\n\nvoid main() {\n    vec4 textureInfo = getCornerValue(textureCoordinates, vertexPosition);\n    vec2 textureShift = getTextureShift(spriteSheet, animationInfo, textureCoordinates);\n    v_textureCoord = (textureInfo.xy + textureShift) / 4096.;\n    v_index = textureIndex;\n    v_opacity = textureInfo.z / 1000.;\n    vec4 vertexPosition4 = vec4(vertexPosition.xy, 0., 1.);\n\n    mat4 finalView = isHud * hudView + (1. - isHud) * view;\n    gl_Position = (ortho * (1. - isPerspective) + perspective * isPerspective) * finalView * matrix * vertexPosition4;\n}\n"
};