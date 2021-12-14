precision mediump float;

const int NUM_TEXTURES = 16;

uniform sampler2D uTextures[NUM_TEXTURES];
uniform float globalLight;

varying vec2 v_textureCoord;
varying float v_index;
varying float v_opacity;

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
	vec4 color = getTextureColor(uTextures, v_index, v_textureCoord);
	if (color.a <= 0.01) {
		discard;
	}
	gl_FragColor = vec4(color.xyz * globalLight, color.w * v_opacity);
}
