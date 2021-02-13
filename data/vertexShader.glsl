precision mediump float;

attribute vec2 vertexPosition;
// attribute mat4 colors;
attribute mat4 matrix;
// attribute float isPerspective;
attribute vec2 position;
attribute float textureIndex;
attribute mat4 textureCoordinates;
attribute vec4 animationInfo;
attribute vec4 spriteSheet;

uniform float time;
// uniform mat4 perspective;
uniform mat4 ortho;
uniform mat4 view;

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

vec2 getTextureShift(vec4 spriteSheet, vec4 animationInfo, mat4 textureCoordinates) {
	float animCols = animationInfo[0];
	float animTotalFrames = animationInfo[1];
	if (animCols == 0. || animTotalFrames == 0.) {
		return vec2(0, 0);
	}
	float framePerSeconds = animationInfo[2];
	float animShift = animationInfo[3];
	float globalFrame = floor((time + animShift) * framePerSeconds / 1000.);
	float frame = modPlus(globalFrame, abs(animTotalFrames));
	float row = floor(frame / animCols);
	float col = floor(frame - row * animCols);

	vec2 cell = vec2(col, row);
	vec2 spriteRect = abs(textureCoordinates[0].xy - textureCoordinates[3].xy);
	return cell * spriteRect;
}

void main() {
	// float vIsPerspective = (sin(time / 1000.) + 1.) * .5 * isPerspective;
	// mat4 projection = vIsPerspective * perspective + (1. - vIsPerspective) * ortho;
	// // Multiply the position by the matrix.
	// gl_Position = projection * view * (vec4(position, 0) + matrix * vec4(vertexPosition, 0, 1.));
	// v_color = getCornerValue(colors, vertexPosition);
	vec4 textureInfo = getCornerValue(textureCoordinates, vertexPosition);
	// vec4 animInfo = vec4(2., 4., 24., 0.);//animationInfo;
	vec2 textureShift = getTextureShift(spriteSheet, animationInfo, textureCoordinates);
	v_textureCoord = (textureInfo.xy + textureShift) / 4096.;
	v_index = textureIndex;
	v_opacity = textureInfo.z / 100.;

	gl_Position = ortho * view * matrix * vec4(vertexPosition.xy, 0, 1.);
}
