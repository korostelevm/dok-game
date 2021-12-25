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
		"isFlag": {
			"type": "UNSIGNED_BYTE",
			"usage": "STATIC_DRAW",
			"instances": 1
		}
	},
	"config": {
		"viewport": {
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
	"fragmentShader": "precision mediump float;\n\nconst int NUM_TEXTURES = 16;\n\nuniform sampler2D uTextures[NUM_TEXTURES];\n\nvarying vec2 v_textureCoord;\nvarying float v_index;\nvarying float v_opacity;\nvarying float v_light;\nvarying vec3 v_HSV;\n\nvec4 getTextureColor(sampler2D textures[NUM_TEXTURES], float textureSlot, vec2 vTexturePoint);\nvec4 alterHueSatLum(vec4 color, vec3 vHSV);\n\nvoid main() {\n    vec4 color = getTextureColor(uTextures, v_index, v_textureCoord);\n    if (color.a <= 0.01) {\n        discard;\n    }\n\n    color = alterHueSatLum(color, v_HSV);\n\n    gl_FragColor = vec4(color.xyz * v_light, color.w * v_opacity);\n}\n\nconst float threshold = 0.00001;\nvec4 getTextureColor(sampler2D textures[NUM_TEXTURES], float textureSlot, vec2 vTexturePoint) {\n    for (int i = 0; i < NUM_TEXTURES; ++i) {\n        if (abs(float(i) - textureSlot) < threshold) {\n            return texture2D(textures[i], vTexturePoint);\n        }\n    }\n    return texture2D(textures[0], vTexturePoint);\n}\n\nconst vec4 Krgb = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\nvec3 rgb2hsv(vec3 c) {\n    vec4 K = Krgb;\n    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));\n    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));\n\n    float d = q.x - min(q.w, q.y);\n    float e = 1.0e-10;\n    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);\n}\n\nconst vec4 Khsv = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\nvec3 hsv2rgb(vec3 c) {\n    vec4 K = Khsv;\n    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n\nvec4 alterHueSatLum(vec4 color, vec3 vHSV) {\n    vec3 fragRGB = color.rgb;\n    vec3 fragHSV = rgb2hsv(fragRGB).xyz;\n    fragHSV.x += vHSV.x;\n    fragHSV.yz *= vHSV.yz;\n    fragRGB = hsv2rgb(fragHSV);\n    return vec4(fragRGB, color.a);\n}",
	"vertexShader": "precision mediump float;\n\nconst int START_FRAME_INDEX = 0;\nconst int END_FRAME_INDEX = 1;\nconst int FRAME_RATE_INDEX = 2;\nconst int MAX_FRAME_COUNT_INDEX = 3;\n\nconst int ANIMATION_UPDATE_INDEX = 0;\nconst int MOTION_UPDATE_INDEX = 1;\n\nconst int TEXTURE_INDEX = 0;\nconst int LIGHT_INDEX = 1;\nconst int HUE_INDEX = 2;\n\nconst int IS_HUD_INDEX = 0;\nconst int IS_SPRITE_INDEX = 1;\n\nattribute vec2 vertexPosition;\nattribute mat4 matrix;\nattribute vec3 motion;\nattribute vec3 acceleration;\nattribute vec3 textureIndex;\nattribute mat4 textureCoordinates;\nattribute vec4 animationInfo;\nattribute vec4 spriteSheet;\nattribute vec4 updateTime;\nattribute vec2 isFlag;\n\nuniform float isPerspective;\nuniform vec2 timeInfo;\nuniform mat4 perspective;\nuniform mat4 ortho;\nuniform mat4 view;\nuniform mat4 hudView;\nuniform mat3 clamp;\nuniform mat4 spriteMatrix;\nuniform float globalLight;\n\n// varying vec4 v_color;\nvarying vec2 v_textureCoord;\nvarying float v_index;\nvarying float v_opacity;\nvarying float v_light;\nvarying vec3 v_HSV;\n\n\nvec4 getCornerValue(mat4 value, vec2 position);\nfloat modPlus(float a, float b);\nvec2 getTextureShift(vec4 spriteSheet, vec4 animInfo, mat4 textureCoordinates, float time);\nfloat det(mat2 matrix);\nmat3 transpose(mat3 matrix);\nmat3 inverse(mat3 matrix);\nvec3 modClampPosition(vec3 position, mat3 clamp);\nvec3 calculateHSV(float zDistance, float hueValue);\nvec3 applyMotion(float dt, vec3 motion, vec3 acceleration);\n\nvoid main() {\n    float time = timeInfo[0];\n    vec4 textureInfo = getCornerValue(textureCoordinates, vertexPosition);\n    vec2 textureShift = getTextureShift(spriteSheet, animationInfo, textureCoordinates, time);\n    v_textureCoord = (textureInfo.xy + textureShift) / 4096.;\n    v_index = textureIndex[TEXTURE_INDEX];\n    v_light = 2. * globalLight * textureIndex[LIGHT_INDEX] / 128.;\n    v_opacity = textureInfo.z / 1000.;\n    vec4 vertexPosition4 = vec4(vertexPosition.x, vertexPosition.y, 0., 1.);\n\n    float isHud = isFlag[IS_HUD_INDEX];\n    float isSprite = isFlag[IS_SPRITE_INDEX];\n\n    mat4 finalView = isHud * hudView + (1. - isHud) * view;\n\n    float motionTime = updateTime[MOTION_UPDATE_INDEX];\n    float dt = (time - motionTime) / 1000.;\n    mat4 mat = matrix;\n    mat4 shift = mat4(1.0);\n    shift[3] = mat[3];\n    shift[3].xyz += applyMotion(dt, motion, acceleration);\n    shift[3].xyz = modClampPosition(shift[3].xyz, clamp);\n\n    mat[3].xyz = vec3(0, 0, 0);\n\n    v_HSV = calculateHSV(shift[3].z, textureIndex[HUE_INDEX] / 256.);\n\n    float isOrtho = max(isHud, 1. - isPerspective);\n    mat4 projection = (ortho * isOrtho + perspective * (1. - isOrtho));\n    mat4 spMatrix = isSprite * spriteMatrix + (1. - isSprite) * mat4(1.0);\n    vec4 position = projection * finalView * shift * spMatrix * mat * vertexPosition4;\n\n    gl_Position = position;\n}\n\nvec3 applyMotion(float dt, vec3 motion, vec3 acceleration) {\n    return dt * motion + 0.5 * dt * dt * acceleration;\n}\n\nvec3 calculateHSV(float zDistance, float hueValue) {\n    float closeSaturation = 1.;\n    float farSaturation = 0.;\n    float farDistance = 1.5;\n    float vHue = hueValue;    //    range 0...1. (1 loops back to normal)\n    float distance = zDistance / 5000.;\n    float dValue = smoothstep(0.0, farDistance, distance) / farDistance;\n    return vec3(1.0 + vHue, (1.0 - dValue) * closeSaturation + dValue * farSaturation, min(1.5, max(0.0, .8 + distance * .8)));\n\n}\n\nfloat modClampFloat(float value, float low, float range) {\n    return low + mod(value - low, range);\n}\n\nvec3 modClampPosition(vec3 position, mat3 clamp) {\n    vec3 xClamp = clamp[0];\n    vec3 yClamp = clamp[1];\n    vec3 zClamp = clamp[2];\n    return vec3(\n        modClampFloat(position.x, xClamp[0], xClamp[1]),\n        modClampFloat(position.y, yClamp[0], yClamp[1]),\n        modClampFloat(position.z, zClamp[0], zClamp[1]));\n}\n\n\nvec4 getCornerValue(mat4 value, vec2 position) {\n    return mix(\n        mix(value[0], value[1], position.x * .5 + .5), \n        mix(value[2], value[3], position.x * .5 + .5),\n        position.y * .5 + .5);    \n}\n\nfloat modPlus(float a, float b) {\n    return mod(a + .4, b);\n}\n\nvec2 getTextureShift(vec4 spriteSheet, vec4 animInfo, mat4 textureCoordinates, float time) {\n    float animCols = spriteSheet[0];\n    if (animCols == 0.) {\n        return vec2(0, 0);\n    }\n    float animTime = updateTime[ANIMATION_UPDATE_INDEX];\n    vec2 frameRange = vec2(animInfo[START_FRAME_INDEX], animInfo[END_FRAME_INDEX]);\n    float frameCount = max(0., frameRange[1] - frameRange[0]) + 1.;\n\n    float framePerSeconds = animInfo[FRAME_RATE_INDEX];\n    float globalFrame = floor(min(\n        (time - animTime) * framePerSeconds / 1000.,\n        animInfo[MAX_FRAME_COUNT_INDEX] - 1.));\n    float frame = frameRange[0] + modPlus(globalFrame, frameCount);\n    float row = floor(frame / animCols);\n    float col = floor(frame - row * animCols);\n\n    vec2 cell = vec2(col, row);\n    vec2 spriteRect = abs(textureCoordinates[0].xy - textureCoordinates[3].xy);\n    return cell * spriteRect;\n}\n\nfloat det(mat2 matrix) {\n    return matrix[0].x * matrix[1].y - matrix[0].y * matrix[1].x;\n}\n\nmat3 transpose(mat3 matrix) {\n    vec3 row0 = matrix[0];\n    vec3 row1 = matrix[1];\n    vec3 row2 = matrix[2];\n    mat3 result = mat3(\n        vec3(row0.x, row1.x, row2.x),\n        vec3(row0.y, row1.y, row2.y),\n        vec3(row0.z, row1.z, row2.z)\n    );\n    return result;\n}\n\nmat3 inverse(mat3 matrix) {\n    vec3 row0 = matrix[0];\n    vec3 row1 = matrix[1];\n    vec3 row2 = matrix[2];\n\n    vec3 minors0 = vec3(\n        det(mat2(row1.y, row1.z, row2.y, row2.z)),\n        det(mat2(row1.z, row1.x, row2.z, row2.x)),\n        det(mat2(row1.x, row1.y, row2.x, row2.y))\n    );\n    vec3 minors1 = vec3(\n        det(mat2(row2.y, row2.z, row0.y, row0.z)),\n        det(mat2(row2.z, row2.x, row0.z, row0.x)),\n        det(mat2(row2.x, row2.y, row0.x, row0.y))\n    );\n    vec3 minors2 = vec3(\n        det(mat2(row0.y, row0.z, row1.y, row1.z)),\n        det(mat2(row0.z, row0.x, row1.z, row1.x)),\n        det(mat2(row0.x, row0.y, row1.x, row1.y))\n    );\n\n    mat3 adj = transpose(mat3(minors0, minors1, minors2));\n\n    return (1.0 / dot(row0, minors0)) * adj;\n}\n\n"
};