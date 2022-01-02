precision mediump float;

const int START_FRAME_INDEX = 0;
const int END_FRAME_INDEX = 1;
const int FRAME_RATE_INDEX = 2;
const int MAX_FRAME_COUNT_INDEX = 3;

const int ANIMATION_UPDATE_INDEX = 0;
const int MOTION_UPDATE_INDEX = 1;

const int TEXTURE_INDEX = 0;
const int LIGHT_INDEX = 1;
const int OPACITY_INDEX = 2;
const int SPRITE_TYPE_INDEX = 3;

const float IS_HUD = 1.;
const float IS_SPRITE = 2.;

const mat4 IDENTITY = mat4(1.0);


attribute vec2 vertexPosition;			
//attribute vec3 normal;
attribute mat4 matrix;				//	4x4
attribute vec3 motion;
attribute vec3 acceleration;
attribute vec4 textureIndex;		//	[ubyte] TEXTURE_INDEX / LIGHT / OPACITY / SPRITE_TYPE
attribute mat4 textureCoordinates;	//	4x4
attribute vec4 animationInfo;		//	START,END,FRAMERATE,MAX_FRAME_COUNT
attribute vec4 spriteSheet;			//	[ushort] col,(row),hotspot_x,hotspot_y
attribute vec4 updateTime;			//	motion_update, animation_update

uniform float isPerspective;
uniform vec2 timeInfo;
uniform mat4 perspective;
uniform mat4 ortho;
uniform mat4 view;
uniform mat4 hudView;
uniform mat3 clamp;
uniform mat4 spriteMatrix;
uniform float globalLight;

varying vec2 v_textureCoord;
varying float v_index;
varying float v_opacity;
varying float v_light;
varying float v_saturation;


vec4 getCornerValue(mat4 textureCoordinates, vec2 position);
float modPlus(float a, float b);
vec2 getTextureShift(vec4 spriteSheet, vec4 animInfo, mat4 textureCoordinates, float time);
vec3 modClampPosition(vec3 position, mat3 clamp);
vec3 applyMotion(float dt, vec3 motion, vec3 acceleration);

void main() {
	float time = timeInfo[0];
	vec4 textureInfo = getCornerValue(textureCoordinates, vertexPosition);
	vec2 textureShift = getTextureShift(spriteSheet, animationInfo, textureCoordinates, time);
	v_textureCoord = (textureInfo.xy + textureShift) / 4095.;
	v_index = textureIndex[TEXTURE_INDEX];
	vec2 hotspot = spriteSheet.zw;
	vec4 vertexPosition4 = vec4(vertexPosition.xy + hotspot * vec2(-.002, .002) + vec2(1., -1.), 0., 1.);

	float isFlag = textureIndex[SPRITE_TYPE_INDEX];
	float isHud = max(0., 1. - abs(isFlag - IS_HUD));
	float isSprite = max(0., 1. - abs(isFlag - IS_SPRITE));

	mat4 finalView = isHud * hudView + (1. - isHud) * view;

	float motionTime = updateTime[MOTION_UPDATE_INDEX];
	float dt = (time - motionTime) / 1000.;
	mat4 mat = matrix;
	mat4 shift = IDENTITY;
	shift[3] = mat[3];
	shift[3].xyz = modClampPosition(shift[3].xyz + applyMotion(dt, motion, acceleration), clamp);
	mat[3].xyz = vec3(0, 0, 0);

	float lightDistance = .7 + -300.0 / shift[3].z;
	v_light = 1.00 * globalLight * textureIndex[LIGHT_INDEX] / 128. * lightDistance;
	v_opacity = textureIndex[OPACITY_INDEX] / 128.;

	float isOrtho = max(isHud, 1. - isPerspective);
	mat4 projection = ortho * isOrtho + perspective * (1. - isOrtho);
	mat4 spMatrix = isSprite * spriteMatrix + (1. - isSprite) * IDENTITY;
	vec4 position = projection * finalView * shift * spMatrix * mat * vertexPosition4;

	gl_Position = position;
}

vec3 applyMotion(float dt, vec3 motion, vec3 acceleration) {
	float dt2 = dt * dt;
	return dt * motion + 0.5 * dt2 * acceleration;
}

float modClampFloat(float value, float low, float range) {
	return low + mod(value - low, range);
}

vec3 modClampPosition(vec3 position, mat3 clamp) {
	vec3 xClamp = clamp[0];
	vec3 yClamp = clamp[1];
	vec3 zClamp = clamp[2];
	return vec3(
		modClampFloat(position.x, xClamp[0], xClamp[1]),
		modClampFloat(position.y, yClamp[0], yClamp[1]),
		modClampFloat(position.z, zClamp[0], zClamp[1]));
}


vec4 getCornerValue(mat4 textureCoordinates, vec2 position) {
	return mix(
		mix(textureCoordinates[0], textureCoordinates[1], position.x * .5 + .5), 
		mix(textureCoordinates[2], textureCoordinates[3], position.x * .5 + .5),
		position.y * .5 + .5);	
}

float modPlus(float a, float b) {
	return mod(a + .4, b);
}

vec2 getTextureShift(vec4 spriteSheet, vec4 animInfo, mat4 textureCoordinates, float time) {
	float animCols = spriteSheet[0];
	if (animCols == 0.) {
		return vec2(0, 0);
	}
	float animTime = updateTime[ANIMATION_UPDATE_INDEX];
	vec2 frameRange = vec2(animInfo[START_FRAME_INDEX], animInfo[END_FRAME_INDEX]);
	float frameCount = max(0., frameRange[1] - frameRange[0]) + 1.;

	float framePerSeconds = animInfo[FRAME_RATE_INDEX];
	float globalFrame = floor(min(
		(time - animTime) * framePerSeconds / 1000.,
		animInfo[MAX_FRAME_COUNT_INDEX] - 1.));
	float frame = frameRange[0] + modPlus(globalFrame, frameCount);
	float row = floor(frame / animCols);
	float col = floor(frame - row * animCols);

	vec2 cell = vec2(col, row);
	vec2 spriteRect = abs(textureCoordinates[0].xy - textureCoordinates[3].xy);
	return cell * spriteRect;
}

