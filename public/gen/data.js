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
		"motion": {
			"type": "FLOAT",
			"usage": "DYNAMIC_DRAW",
			"instances": 1
		},
		"acceleration": {
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
		"newgrounds": {
			"game": "The Impossible Room",
			"url": "https://www.newgrounds.com/portal/view/823348",
			"key": "53522:zs4SBILE",
			"secret": "jq6s6DaxBvK3Thlr+cZ+bw=="
		},
		"maxInstancesCount": 10000
	},
	"fragmentShader": "precision mediump float;\n\nconst int NUM_TEXTURES = 16;\n\nuniform sampler2D uTextures[NUM_TEXTURES];\nuniform float globalLight;\n\nvarying vec2 v_textureCoord;\nvarying float v_index;\nvarying float v_opacity;\nvarying float v_light;\n\nvec4 getTextureColor(sampler2D textures[NUM_TEXTURES], float textureSlot, vec2 vTexturePoint) {\n    float threshold = 0.00001;\n    for (int i = 0; i < NUM_TEXTURES; ++i) {\n        if (abs(float(i) - textureSlot) < threshold) {\n            return texture2D(textures[i], vTexturePoint);\n        }\n    }\n    return texture2D(textures[0], vTexturePoint);\n}\n\nvoid main() {\n    vec4 color = getTextureColor(uTextures, v_index, v_textureCoord);\n    if (color.a <= 0.01) {\n        discard;\n    }\n    gl_FragColor = vec4(color.xyz * globalLight * v_light, color.w * v_opacity);\n}\n",
	"vertexShader": "precision mediump float;\n\nconst int START_FRAME_INDEX = 0;\nconst int END_FRAME_INDEX = 1;\nconst int FRAME_RATE_INDEX = 2;\nconst int MAX_FRAME_COUNT_INDEX = 3;\nconst int ANIMATION_UPDATE_INDEX = 0;\nconst int MOTION_UPDATE_INDEX = 1;\n\nattribute vec2 vertexPosition;\n// attribute mat4 colors;\nattribute mat4 matrix;\nattribute vec3 motion;\nattribute vec3 acceleration;\n// attribute vec2 position;\nattribute vec2 textureIndex;\nattribute mat4 textureCoordinates;\nattribute vec4 animationInfo;\nattribute vec4 spriteSheet;\nattribute vec4 updateTime;\nattribute float isHud;\n\nuniform float isPerspective;\nuniform vec2 timeInfo;\nuniform mat4 perspective;\nuniform mat4 ortho;\nuniform mat4 view;\nuniform mat4 hudView;\nuniform mat3 clamp;\n\n// varying vec4 v_color;\nvarying vec2 v_textureCoord;\nvarying float v_index;\nvarying float v_opacity;\nvarying float v_light;\n\nvec4 getCornerValue(mat4 value, vec2 position) {\n    return mix(\n        mix(value[0], value[1], position.x * .5 + .5), \n        mix(value[2], value[3], position.x * .5 + .5),\n        position.y * .5 + .5);    \n}\n\nfloat modPlus(float a, float b) {\n    return mod(a + .4, b);\n}\n\nvec2 getTextureShift(vec4 spriteSheet, vec4 animInfo, mat4 textureCoordinates, float time) {\n    float animCols = spriteSheet[0];\n    if (animCols == 0.) {\n        return vec2(0, 0);\n    }\n    float animTime = updateTime[ANIMATION_UPDATE_INDEX];\n    vec2 frameRange = vec2(animInfo[START_FRAME_INDEX], animInfo[END_FRAME_INDEX]);\n    float frameCount = max(0., frameRange[1] - frameRange[0]) + 1.;\n\n    float framePerSeconds = animInfo[FRAME_RATE_INDEX];\n    float globalFrame = floor(min(\n        (time - animTime) * framePerSeconds / 1000.,\n        animInfo[MAX_FRAME_COUNT_INDEX] - 1.));\n    float frame = frameRange[0] + modPlus(globalFrame, frameCount);\n    float row = floor(frame / animCols);\n    float col = floor(frame - row * animCols);\n\n    vec2 cell = vec2(col, row);\n    vec2 spriteRect = abs(textureCoordinates[0].xy - textureCoordinates[3].xy);\n    return cell * spriteRect;\n}\n\nvoid main() {\n    float time = timeInfo[0];\n    vec4 textureInfo = getCornerValue(textureCoordinates, vertexPosition);\n    vec2 textureShift = getTextureShift(spriteSheet, animationInfo, textureCoordinates, time);\n    v_textureCoord = (textureInfo.xy + textureShift) / 4096.;\n    v_index = textureIndex[0];\n    v_light = textureIndex[1] / 128.;\n    v_opacity = textureInfo.z / 1000.;\n    vec4 vertexPosition4 = vec4(vertexPosition.x, vertexPosition.y, 0., 1.);\n\n    float motionTime = updateTime[MOTION_UPDATE_INDEX];\n    float dt = (time - motionTime) / 1000.;\n    mat4 mat = matrix;\n    mat[3].xyz += dt * motion + 0.5 * dt * dt * acceleration;\n    mat[3].x = clamp[0][0] + mod(mat[3].x - clamp[0][0], clamp[0][1]);\n    mat[3].y = clamp[1][0] + mod(mat[3].y - clamp[1][0], clamp[1][1]);\n    mat[3].z = clamp[2][0] + mod(mat[3].z - clamp[2][0], clamp[2][1]);\n\n    mat4 finalView = isHud * hudView + (1. - isHud) * view;\n    float isOrtho = max(isHud, 1. - isPerspective);\n    gl_Position = (ortho * isOrtho + perspective * (1. - isOrtho))\n        * finalView * mat * vertexPosition4;\n}\n"
};