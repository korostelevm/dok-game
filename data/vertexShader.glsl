precision mediump float;

const int START_FRAME_INDEX = 0;
const int END_FRAME_INDEX = 1;
const int FRAME_RATE_INDEX = 2;
const int MAX_FRAME_COUNT_INDEX = 3;
const int ANIMATION_UPDATE_INDEX = 0;

attribute vec2 vertexPosition;
// attribute mat4 colors;
attribute mat4 matrix;
// attribute vec2 position;
attribute float textureIndex;
attribute mat4 textureCoordinates;
attribute vec4 animationInfo;
attribute vec4 spriteSheet;
attribute vec4 updateTime;
attribute float isHud;

uniform float isPerspective;
uniform vec2 timeInfo;
uniform mat4 perspective;
uniform mat4 ortho;
uniform mat4 view;
uniform mat4 hudView;

// varying vec4 v_color;
varying vec2 v_textureCoord;
varying float v_index;
varying float v_opacity;

vec4 getCornerValue(mat4 value, vec2 position) {
	return mix(
		mix(value[0], value[1], position.x * .5 + .5), 
		mix(value[2], value[3], position.x * .5 + .5),
		position.y * .5 + .5);	
}

float modPlus(float a, float b) {
	return mod(a + .4, b);
}

vec2 getTextureShift(vec4 spriteSheet, vec4 animInfo, mat4 textureCoordinates) {
	float animCols = spriteSheet[0];
	if (animCols == 0.) {
		return vec2(0, 0);
	}
	float animTime = updateTime[ANIMATION_UPDATE_INDEX];
	vec2 frameRange = vec2(animInfo[START_FRAME_INDEX], animInfo[END_FRAME_INDEX]);
	float frameCount = max(0., frameRange[1] - frameRange[0]) + 1.;

	float framePerSeconds = animInfo[FRAME_RATE_INDEX];
	float time = timeInfo[0];
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

void main() {
	vec4 textureInfo = getCornerValue(textureCoordinates, vertexPosition);
	vec2 textureShift = getTextureShift(spriteSheet, animationInfo, textureCoordinates);
	v_textureCoord = (textureInfo.xy + textureShift) / 4096.;
	v_index = textureIndex;
	v_opacity = textureInfo.z / 1000.;
	vec4 vertexPosition4 = vec4(vertexPosition.x, vertexPosition.y, 0., 1.);

	mat4 finalView = isHud * hudView + (1. - isHud) * view;
	gl_Position = (ortho * (1. - isPerspective) + perspective * isPerspective) * finalView * matrix * vertexPosition4;
}
