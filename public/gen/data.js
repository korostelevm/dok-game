const globalData = {
  "attributes": {
    "vertexPosition": {"location": 0, "type": "FLOAT", "usage": "STATIC_DRAW"},
    "matrix": {"type": "FLOAT", "usage": "DYNAMIC_DRAW", "instances": 1},
    "motion": {"type": "FLOAT", "usage": "DYNAMIC_DRAW", "instances": 1},
    "acceleration": {"type": "FLOAT", "usage": "DYNAMIC_DRAW", "instances": 1},
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
    "animationInfo": {"type": "FLOAT", "usage": "DYNAMIC_DRAW", "instances": 1},
    "updateTime": {"type": "FLOAT", "usage": "DYNAMIC_DRAW", "instances": 1}
  },
  "config": {
    "webgl": {
      "antialias": false,
      "preserveDrawingBuffer": false,
      "alpha": false,
      "depth": true,
      "stencil": false,
      "desynchronized": true,
      "premultipliedAlpha": true,
      "cullFace": "none"
    },
    "newgrounds": {
      "game": "Duel",
      "url": "https://www.newgrounds.com/portal/view/1829991",
      "key": "54001:nA8a5SpY",
      "secret": "BXFgTKBQSWI/mVLxYLCuxA=="
    },
    "maxInstancesCount": 10000
  },
  "fragmentShader": "#version 300 es\n\nprecision mediump float;\n\nconst int NUM_TEXTURES = 16;\n\nuniform sampler2D uTextures[NUM_TEXTURES];\n\nin vec2 v_textureCoord;\nin float v_index;\nin float v_opacity;\nin float v_light;\n\nout vec4 outColor;\n\nvec4 getTextureColor(sampler2D textures[NUM_TEXTURES], float textureSlot, vec2 vTexturePoint);\n\nvoid main() {\n    vec4 color = getTextureColor(uTextures, v_index, v_textureCoord);\n    if (color.a <= 0.01) {\n        discard;\n    }\n\n    outColor = vec4(color.xyz * v_light, color.w * v_opacity);\n}\n\nconst float threshold = 0.00001;\nvec4 getTextureColor(sampler2D textures[NUM_TEXTURES], float textureSlot, vec2 vTexturePoint) {\n    if (abs(0.0 - textureSlot) < threshold) {\n        return texture(textures[0], vTexturePoint);\n    }\n    if (abs(1.0 - textureSlot) < threshold) {\n        return texture(textures[1], vTexturePoint);\n    }\n    if (abs(2.0 - textureSlot) < threshold) {\n        return texture(textures[2], vTexturePoint);\n    }\n    if (abs(3.0 - textureSlot) < threshold) {\n        return texture(textures[3], vTexturePoint);\n    }\n    if (abs(4.0 - textureSlot) < threshold) {\n        return texture(textures[4], vTexturePoint);\n    }\n    if (abs(5.0 - textureSlot) < threshold) {\n        return texture(textures[5], vTexturePoint);\n    }\n    if (abs(6.0 - textureSlot) < threshold) {\n        return texture(textures[6], vTexturePoint);\n    }\n    if (abs(7.0 - textureSlot) < threshold) {\n        return texture(textures[7], vTexturePoint);\n    }\n    if (abs(8.0 - textureSlot) < threshold) {\n        return texture(textures[8], vTexturePoint);\n    }\n    if (abs(9.0 - textureSlot) < threshold) {\n        return texture(textures[9], vTexturePoint);\n    }\n    if (abs(10.0 - textureSlot) < threshold) {\n        return texture(textures[10], vTexturePoint);\n    }\n    if (abs(11.0 - textureSlot) < threshold) {\n        return texture(textures[11], vTexturePoint);\n    }\n    if (abs(12.0 - textureSlot) < threshold) {\n        return texture(textures[12], vTexturePoint);\n    }\n    if (abs(13.0 - textureSlot) < threshold) {\n        return texture(textures[13], vTexturePoint);\n    }\n    if (abs(14.0 - textureSlot) < threshold) {\n        return texture(textures[14], vTexturePoint);\n    }\n    if (abs(15.0 - textureSlot) < threshold) {\n        return texture(textures[15], vTexturePoint);\n    }\n    return texture(textures[0], vTexturePoint);\n}",
  "vertexShader": "#version 300 es\n\nprecision mediump float;\n\nconst int START_FRAME_INDEX = 0;\nconst int END_FRAME_INDEX = 1;\nconst int FRAME_RATE_INDEX = 2;\nconst int MAX_FRAME_COUNT_INDEX = 3;\n\nconst int ANIMATION_UPDATE_INDEX = 0;\nconst int MOTION_UPDATE_INDEX = 1;\n\nconst int TEXTURE_INDEX = 0;\nconst int LIGHT_INDEX = 1;\nconst int OPACITY_INDEX = 2;\nconst int SPRITE_TYPE_INDEX = 3;\n\nconst float IS_HUD = 1.;\nconst float IS_SPRITE = 2.;\n\nconst mat4 IDENTITY = mat4(1.0);\n\n\nin vec2 vertexPosition;            \n//attribute vec3 normal;\nin mat4 matrix;                //    4x4\nin vec3 motion;\nin vec3 acceleration;\nin vec4 textureIndex;        //    [ubyte] TEXTURE_INDEX / LIGHT / OPACITY / SPRITE_TYPE\nin mat4 textureCoordinates;    //    4x4\nin vec4 animationInfo;        //    START,END,FRAMERATE,MAX_FRAME_COUNT\nin vec4 spriteSheet;            //    [ushort] col,(row),hotspot_x,hotspot_y\nin vec4 updateTime;            //    motion_update, animation_update\n\nuniform float isPerspective;\nuniform float timeInfo;\nuniform mat4 perspective;\nuniform mat4 ortho;\nuniform mat4 view;\nuniform mat4 hudView;\nuniform mat3 clamp;\nuniform mat4 spriteMatrix;\nuniform float globalLight;\n\nout vec2 v_textureCoord;\nout float v_index;\nout float v_opacity;\nout float v_light;\nout float v_saturation;\n\n\nvec4 getCornerValue(mat4 textureCoordinates, vec2 position);\nfloat modPlus(float a, float b);\nvec2 getTextureShift(vec4 spriteSheet, vec4 animInfo, mat4 textureCoordinates, float time);\nvec3 modClampPosition(vec3 position, mat3 clamp);\nvec3 applyMotion(float dt, vec3 motion, vec3 acceleration);\n\nvoid main() {\n    float time = timeInfo;\n    vec4 textureInfo = getCornerValue(textureCoordinates, vertexPosition);\n    vec2 textureShift = getTextureShift(spriteSheet, animationInfo, textureCoordinates, time);\n    v_textureCoord = (textureInfo.xy + textureShift) / 4096.;\n    v_index = textureIndex[TEXTURE_INDEX];\n    vec2 hotspot = spriteSheet.zw;\n    vec4 vertexPosition4 = vec4(vertexPosition.xy + hotspot * vec2(-.002, .002) + vec2(1., -1.), 0., 1.);\n\n    float isFlag = textureIndex[SPRITE_TYPE_INDEX];\n    float isHud = max(0., 1. - abs(isFlag - IS_HUD));\n    float isSprite = max(0., 1. - abs(isFlag - IS_SPRITE));\n\n    mat4 finalView = isHud * hudView + (1. - isHud) * view;\n\n    float motionTime = updateTime[MOTION_UPDATE_INDEX];\n    float dt = (time - motionTime) / 1000.;\n    mat4 mat = matrix;\n\n    mat4 shift = IDENTITY;\n    shift[3] = mat[3];\n\n    shift[3].xyz = shift[3].xyz + applyMotion(dt, motion, acceleration);\n    mat[3].xyz = vec3(0, 0, 0);\n\n    v_opacity = textureIndex[OPACITY_INDEX] / 128.;\n\n    float isOrtho = max(isHud, 1. - isPerspective);\n    mat4 projection = ortho * isOrtho + perspective * (1. - isOrtho);\n    mat4 spMatrix = isSprite * spriteMatrix + (1. - isSprite) * IDENTITY;\n\n    mat4 finalViewShift = finalView * shift;\n    finalViewShift[3].xyz = modClampPosition(finalViewShift[3].xyz, clamp);\n    vec4 relativePosition = finalViewShift * spMatrix * mat * vertexPosition4;\n\n    float lightDistance = 1. + -100.0 / length(relativePosition);\n    v_light = 1.00 * globalLight * textureIndex[LIGHT_INDEX] / 128. * lightDistance;\n\n    vec4 position = projection * relativePosition;\n\n    gl_Position = position;\n}\n\nvec3 applyMotion(float dt, vec3 motion, vec3 acceleration) {\n    float dt2 = dt * dt;\n    return dt * motion + 0.5 * dt2 * acceleration;\n}\n\nfloat modClampFloat(float value, float low, float range) {\n    return low + mod(value - low, range);\n}\n\nvec3 modClampPosition(vec3 position, mat3 clamp) {\n    vec3 xClamp = clamp[0];\n    vec3 yClamp = clamp[1];\n    vec3 zClamp = clamp[2];\n    return vec3(\n        modClampFloat(position.x, xClamp[0], xClamp[1]),\n        modClampFloat(position.y, yClamp[0], yClamp[1]),\n        modClampFloat(position.z, zClamp[0], zClamp[1]));\n}\n\n\nvec4 getCornerValue(mat4 textureCoordinates, vec2 position) {\n    return mix(\n        mix(textureCoordinates[0], textureCoordinates[1], position.x * .5 + .5), \n        mix(textureCoordinates[2], textureCoordinates[3], position.x * .5 + .5),\n        position.y * .5 + .5);    \n}\n\nfloat modPlus(float a, float b) {\n    return mod(a + .4, b);\n}\n\nvec2 getTextureShift(vec4 spriteSheet, vec4 animInfo, mat4 textureCoordinates, float time) {\n    float animCols = spriteSheet[0];\n    if (animCols == 0.) {\n        return vec2(0, 0);\n    }\n    float animTime = updateTime[ANIMATION_UPDATE_INDEX];\n    vec2 frameRange = vec2(animInfo[START_FRAME_INDEX], animInfo[END_FRAME_INDEX]);\n    float frameCount = max(0., frameRange[1] - frameRange[0]) + 1.;\n\n    float framePerSeconds = abs(animInfo[FRAME_RATE_INDEX]);\n    float globalFrame = floor(min(\n        (time - animTime) * framePerSeconds / 1000.,\n        animInfo[MAX_FRAME_COUNT_INDEX]));\n\n    float frameOffset = modPlus(globalFrame, frameCount);\n    float frame;\n    if (animInfo[FRAME_RATE_INDEX] > 0.) {\n        frame = frameRange[0] + frameOffset;\n    } else {\n        frame = frameRange[1] - frameOffset;\n    }\n\n    float row = floor(frame / animCols);\n    float col = floor(frame - row * animCols);\n\n    vec2 cell = vec2(col, row);\n    vec2 spriteRect = abs(textureCoordinates[0].xy - textureCoordinates[3].xy);\n    return cell * spriteRect;\n}\n\n"
};