precision mediump float;

attribute vec2 vertexPosition;
// attribute mat4 colors;
attribute mat4 matrix;
// attribute float isPerspective;
attribute vec2 position;
attribute float textureIndex;
attribute mat4 textureCoordinates;
attribute vec4 animationInfo;

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

vec2 getTextureShift(vec4 animationInfo, mat4 textureCoordinates) {
	float animCols = animationInfo[0];
	float animTotalFrames = animationInfo[1];
	if (animCols == 0. || animTotalFrames == 0.) {
		return vec2(0, 0);
	}
	float framePerSeconds = animationInfo[2];
	float animTime = animationInfo[3];
	float timeElapsed = time - animTime;
	float frame = floor(mod(timeElapsed * framePerSeconds / 1000., animTotalFrames));
	vec2 cell = vec2(mod(frame, animCols), floor(frame / animCols));
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
	vec4 animInfo = animationInfo;
	vec2 textureShift = getTextureShift(animInfo, textureCoordinates);
	v_textureCoord = (textureInfo.xy + textureShift) / 4096.;
	v_index = textureIndex;
	v_opacity = textureInfo.z / 100.;

	gl_Position = ortho * view * matrix * vec4(vertexPosition.xy, 0, 1.);
}
