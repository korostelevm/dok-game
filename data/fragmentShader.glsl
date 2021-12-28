precision mediump float;

const int NUM_TEXTURES = 16;

uniform sampler2D uTextures[NUM_TEXTURES];

varying vec2 v_textureCoord;
varying float v_index;
varying float v_opacity;
varying float v_light;

vec4 getTextureColor(sampler2D textures[NUM_TEXTURES], float textureSlot, vec2 vTexturePoint);

void main() {
	vec4 color = getTextureColor(uTextures, v_index, v_textureCoord);
	if (color.a <= 0.01) {
		discard;
	}

	gl_FragColor = vec4(color.xyz * v_light, color.w * v_opacity);
}

const float threshold = 0.00001;
vec4 getTextureColor(sampler2D textures[NUM_TEXTURES], float textureSlot, vec2 vTexturePoint) {
	for (int i = 0; i < NUM_TEXTURES; ++i) {
		if (abs(float(i) - textureSlot) < threshold) {
			return texture2D(textures[i], vTexturePoint);
		}
	}
	return texture2D(textures[0], vTexturePoint);
}