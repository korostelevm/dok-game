precision mediump float;

const int START_FRAME_INDEX = 0;
const int END_FRAME_INDEX = 1;
const int FRAME_RATE_INDEX = 2;
const int MAX_FRAME_COUNT_INDEX = 3;

const int ANIMATION_UPDATE_INDEX = 0;
const int MOTION_UPDATE_INDEX = 1;

const int TEXTURE_INDEX = 0;
const int LIGHT_INDEX = 1;
const int HUE_INDEX = 2;

const int IS_HUD_INDEX = 0;
const int IS_SPRITE_INDEX = 1;

attribute vec2 vertexPosition;			
attribute mat4 matrix;				//	4
attribute vec3 motion;
attribute vec3 acceleration;
attribute vec3 textureIndex;
attribute mat4 textureCoordinates;	//	4
attribute vec4 animationInfo;
attribute vec4 spriteSheet;
attribute vec4 updateTime;
attribute vec2 isFlag;

uniform float isPerspective;
uniform vec2 timeInfo;
uniform mat4 perspective;
uniform mat4 ortho;
uniform mat4 view;
uniform mat4 hudView;
uniform mat3 clamp;
uniform mat4 spriteMatrix;
uniform float globalLight;

// varying vec4 v_color;
varying vec2 v_textureCoord;
varying float v_index;
varying float v_opacity;
varying float v_light;
varying vec3 v_HSV;


vec4 getCornerValue(mat4 textureCoordinates, vec2 position);
float modPlus(float a, float b);
vec2 getTextureShift(vec4 spriteSheet, vec4 animInfo, mat4 textureCoordinates, float time);
float det(mat2 matrix);
mat3 transpose(mat3 matrix);
mat3 inverse(mat3 matrix);
vec3 modClampPosition(vec3 position, mat3 clamp);
vec3 calculateHSV(float zDistance, float hueValue);
vec3 applyMotion(float dt, vec3 motion, vec3 acceleration);

void main() {
	float time = timeInfo[0];
	vec4 textureInfo = getCornerValue(textureCoordinates, vertexPosition);
	vec2 textureShift = getTextureShift(spriteSheet, animationInfo, textureCoordinates, time);
	v_textureCoord = (textureInfo.xy + textureShift) / 4096.;
	v_index = textureIndex[TEXTURE_INDEX];
	v_light = 1.75 * globalLight * textureIndex[LIGHT_INDEX] / 128.;
	v_opacity = textureInfo.z / 1000.;
	vec4 vertexPosition4 = vec4(vertexPosition.xy, 0., 1.);

	float isHud = isFlag[IS_HUD_INDEX];
	float isSprite = isFlag[IS_SPRITE_INDEX];

	mat4 finalView = isHud * hudView + (1. - isHud) * view;

	float motionTime = updateTime[MOTION_UPDATE_INDEX];
	float dt = (time - motionTime) / 1000.;
	mat4 mat = matrix;
	mat4 shift = mat4(1.0);
	shift[3] = mat[3];
	shift[3].xyz += applyMotion(dt, motion, acceleration);
	shift[3].xyz = modClampPosition(shift[3].xyz, clamp);
	mat[3].xyz = vec3(0, 0, 0);

	v_HSV = calculateHSV(shift[3].z, textureIndex[HUE_INDEX] / 256.);

	float isOrtho = max(isHud, 1. - isPerspective);
	mat4 projection = (ortho * isOrtho + perspective * (1. - isOrtho));
	mat4 spMatrix = isSprite * spriteMatrix + (1. - isSprite) * mat4(1.0);
	vec4 position = projection * finalView * shift * spMatrix * mat * vertexPosition4;

	gl_Position = position;
}

vec3 applyMotion(float dt, vec3 motion, vec3 acceleration) {
	float dt2 = dt * dt;
	return dt * motion + 0.5 * dt2 * acceleration;
}

vec3 calculateHSV(float zDistance, float hueValue) {
	float closeSaturation = 1.;
	float farSaturation = 0.;
	float farDistance = 1.5;
	float vHue = hueValue;	//	range 0...1. (1 loops back to normal)
	float distance = zDistance / 5000.;
	float dValue = smoothstep(0.0, farDistance, distance) / farDistance;
	return vec3(1.0 + vHue, (1.0 - dValue) * closeSaturation + dValue * farSaturation, min(1.5, max(0.0, .8 + distance * .8)));

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

float det(mat2 matrix) {
    return matrix[0].x * matrix[1].y - matrix[0].y * matrix[1].x;
}

mat3 transpose(mat3 matrix) {
    vec3 row0 = matrix[0];
    vec3 row1 = matrix[1];
    vec3 row2 = matrix[2];
    mat3 result = mat3(
        vec3(row0.x, row1.x, row2.x),
        vec3(row0.y, row1.y, row2.y),
        vec3(row0.z, row1.z, row2.z)
    );
    return result;
}

mat3 inverse(mat3 matrix) {
    vec3 row0 = matrix[0];
    vec3 row1 = matrix[1];
    vec3 row2 = matrix[2];

    vec3 minors0 = vec3(
        det(mat2(row1.y, row1.z, row2.y, row2.z)),
        det(mat2(row1.z, row1.x, row2.z, row2.x)),
        det(mat2(row1.x, row1.y, row2.x, row2.y))
    );
    vec3 minors1 = vec3(
        det(mat2(row2.y, row2.z, row0.y, row0.z)),
        det(mat2(row2.z, row2.x, row0.z, row0.x)),
        det(mat2(row2.x, row2.y, row0.x, row0.y))
    );
    vec3 minors2 = vec3(
        det(mat2(row0.y, row0.z, row1.y, row1.z)),
        det(mat2(row0.z, row0.x, row1.z, row1.x)),
        det(mat2(row0.x, row0.y, row1.x, row1.y))
    );

    mat3 adj = transpose(mat3(minors0, minors1, minors2));

    return (1.0 / dot(row0, minors0)) * adj;
}

