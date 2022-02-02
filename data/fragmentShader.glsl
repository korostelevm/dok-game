#version 300 es

precision mediump float;

const int NUM_TEXTURES = 16;

uniform sampler2D uTextures[NUM_TEXTURES];

in vec2 v_textureCoord;
in float v_index;
in float v_opacity;
in float v_light;

out vec4 outColor;

vec4 getTextureColor(sampler2D textures[NUM_TEXTURES], float textureSlot, vec2 vTexturePoint);

void main() {
	vec4 color = getTextureColor(uTextures, v_index, v_textureCoord);
	if (color.a <= 0.01) {
		discard;
	}

	outColor = vec4(color.xyz * v_light, color.w * v_opacity);
}

const float threshold = 0.00001;
vec4 getTextureColor(sampler2D textures[NUM_TEXTURES], float textureSlot, vec2 vTexturePoint) {
	if (abs(0.0 - textureSlot) < threshold) {
		return texture(textures[0], vTexturePoint);
	}
	if (abs(1.0 - textureSlot) < threshold) {
		return texture(textures[1], vTexturePoint);
	}
	if (abs(2.0 - textureSlot) < threshold) {
		return texture(textures[2], vTexturePoint);
	}
	if (abs(3.0 - textureSlot) < threshold) {
		return texture(textures[3], vTexturePoint);
	}
	if (abs(4.0 - textureSlot) < threshold) {
		return texture(textures[4], vTexturePoint);
	}
	if (abs(5.0 - textureSlot) < threshold) {
		return texture(textures[5], vTexturePoint);
	}
	if (abs(6.0 - textureSlot) < threshold) {
		return texture(textures[6], vTexturePoint);
	}
	if (abs(7.0 - textureSlot) < threshold) {
		return texture(textures[7], vTexturePoint);
	}
	if (abs(8.0 - textureSlot) < threshold) {
		return texture(textures[8], vTexturePoint);
	}
	if (abs(9.0 - textureSlot) < threshold) {
		return texture(textures[9], vTexturePoint);
	}
	if (abs(10.0 - textureSlot) < threshold) {
		return texture(textures[10], vTexturePoint);
	}
	if (abs(11.0 - textureSlot) < threshold) {
		return texture(textures[11], vTexturePoint);
	}
	if (abs(12.0 - textureSlot) < threshold) {
		return texture(textures[12], vTexturePoint);
	}
	if (abs(13.0 - textureSlot) < threshold) {
		return texture(textures[13], vTexturePoint);
	}
	if (abs(14.0 - textureSlot) < threshold) {
		return texture(textures[14], vTexturePoint);
	}
	if (abs(15.0 - textureSlot) < threshold) {
		return texture(textures[15], vTexturePoint);
	}
	return texture(textures[0], vTexturePoint);
}