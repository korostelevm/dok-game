precision mediump float;

const int NUM_TEXTURES = 16;

uniform float time;
uniform sampler2D uTextures[NUM_TEXTURES];

// varying vec4 v_color;
varying vec2 v_textureCoord;
varying float v_index;

vec4 getTextureColor(sampler2D textures[NUM_TEXTURES], float textureSlot, vec2 vTexturePoint) {
	float threshold = 0.00001;
	for (int i = 0; i < NUM_TEXTURES; ++i) {
		if (abs(float(i) - textureSlot) < threshold) {
			return texture2D(textures[i], vTexturePoint);
		}
	}
	return texture2D(textures[0], vTexturePoint);
}

void main() {
	// gl_FragColor = vec4(1.,
	// 	gl_FragCoord.x / 512. + sin(time / 1000.),
	// 	gl_FragCoord.y / 512. + cos(time / 1000.),
	// 	.5);
	gl_FragColor = getTextureColor(uTextures, v_index, v_textureCoord.xy);
}
