precision mediump float;

attribute vec2 vertexPosition;
// attribute mat4 colors;
// attribute mat4 matrix;
// attribute float isPerspective;
attribute vec2 position;
attribute float textureIndex;
attribute mat4 textureCoordinates;

uniform float time;
// uniform mat4 perspective;
// uniform mat4 ortho;
// uniform mat4 view;

// varying vec4 v_color;
varying vec2 v_textureCoord;
varying float v_index;

vec4 getCornerValue(mat4 value, vec2 position) {
	return mix(
		mix(value[0], value[1], position.x * .5 + .5), 
		mix(value[2], value[3], position.x * .5 + .5),
		position.y * .5 + .5);	
}

void main() {
	// float vIsPerspective = (sin(time / 1000.) + 1.) * .5 * isPerspective;
	// mat4 projection = vIsPerspective * perspective + (1. - vIsPerspective) * ortho;
	// // Multiply the position by the matrix.
	// gl_Position = projection * view * (vec4(position, 0) + matrix * vec4(vertexPosition, 0, 1.));
	// v_color = getCornerValue(colors, vertexPosition);
	vec4 textureInfo = getCornerValue(textureCoordinates, vertexPosition);
	v_textureCoord = textureInfo.xy / 4096.;
	v_index = textureIndex;

	gl_Position = vec4(position.xy, 0, 1.);
}
