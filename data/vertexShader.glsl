precision mediump float;

const int START_FRAME_INDEX = 0;
const int END_FRAME_INDEX = 1;
const int FRAME_RATE_INDEX = 2;
const int MAX_FRAME_COUNT_INDEX = 3;
const int ANIMATION_UPDATE_INDEX = 0;
const int MOTION_UPDATE_INDEX = 1;

attribute vec2 vertexPosition;
// attribute mat4 colors;
attribute mat4 matrix;
attribute vec3 motion;
attribute vec3 acceleration;
// attribute vec2 position;
attribute vec2 textureIndex;
attribute mat4 textureCoordinates;
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

// varying vec4 v_color;
varying vec2 v_textureCoord;
varying float v_index;
varying float v_opacity;
varying float v_light;
varying float zDist;


vec4 getCornerValue(mat4 value, vec2 position);
float modPlus(float a, float b);
vec2 getTextureShift(vec4 spriteSheet, vec4 animInfo, mat4 textureCoordinates, float time);
float det(mat2 matrix);
mat3 transpose(mat3 matrix);
mat3 inverse(mat3 matrix);

void main() {
	float time = timeInfo[0];
	vec4 textureInfo = getCornerValue(textureCoordinates, vertexPosition);
	vec2 textureShift = getTextureShift(spriteSheet, animationInfo, textureCoordinates, time);
	v_textureCoord = (textureInfo.xy + textureShift) / 4096.;
	v_index = textureIndex[0];
	v_light = textureIndex[1] / 128.;
	v_opacity = textureInfo.z / 1000.;
	vec4 vertexPosition4 = vec4(vertexPosition.x, vertexPosition.y, 0., 1.);

	float isHud = isFlag[0];
	float isSprite = isFlag[1];

	mat4 finalView = isHud * hudView + (1. - isHud) * view;

	float motionTime = updateTime[MOTION_UPDATE_INDEX];
	float dt = (time - motionTime) / 1000.;
	mat4 mat = matrix;
	mat4 shift = mat4(1.0);
	shift[3] = mat[3];
	shift[3].xyz += dt * motion + 0.5 * dt * dt * acceleration;
	shift[3].x = clamp[0][0] + mod(shift[3].x - clamp[0][0], clamp[0][1]);
	shift[3].y = clamp[1][0] + mod(shift[3].y - clamp[1][0], clamp[1][1]);
	shift[3].z = clamp[2][0] + mod(shift[3].z - clamp[2][0], clamp[2][1]);

	mat[3].xyz = vec3(0, 0, 0);

	float isOrtho = max(isHud, 1. - isPerspective);
	mat4 projection = (ortho * isOrtho + perspective * (1. - isOrtho));
	mat4 spMatrix = isSprite * spriteMatrix + (1. - isSprite) * mat4(1.0);
	vec4 position = projection * finalView * shift * spMatrix * mat * vertexPosition4;

	zDist = shift[3].z / 5000.;	
	gl_Position = position;
}


vec4 getCornerValue(mat4 value, vec2 position) {
	return mix(
		mix(value[0], value[1], position.x * .5 + .5), 
		mix(value[2], value[3], position.x * .5 + .5),
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

