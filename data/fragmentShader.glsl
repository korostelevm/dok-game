precision mediump float;

const int NUM_TEXTURES = 16;

uniform sampler2D uTextures[NUM_TEXTURES];
uniform float globalLight;

varying vec2 v_textureCoord;
varying float v_index;
varying float v_opacity;
varying float v_light;
varying float zDist;

vec4 getTextureColor(sampler2D textures[NUM_TEXTURES], float textureSlot, vec2 vTexturePoint);
vec4 alterHueSatLum(vec4 color, vec3 vHSV);

void main() {
	vec4 color = getTextureColor(uTextures, v_index, v_textureCoord);
	if (color.a <= 0.01) {
		discard;
	}

	float closeSaturation = 1.;
	float farSaturation = 0.;
	float farDistance = 1.5;
	float vHue = 0.;	//	range 0...1. (1 loops back to normal)
	float distance = zDist;
	float dValue = smoothstep(0.0, farDistance, distance) / farDistance;
	color = alterHueSatLum(color, vec3(1.0 + vHue, (1.0 - dValue) * closeSaturation + dValue * farSaturation, min(1.5, max(0.0, 1. + distance))));

	gl_FragColor = vec4(color.xyz * globalLight * v_light, color.w * v_opacity);
}

vec4 getTextureColor(sampler2D textures[NUM_TEXTURES], float textureSlot, vec2 vTexturePoint) {
	float threshold = 0.00001;
	for (int i = 0; i < NUM_TEXTURES; ++i) {
		if (abs(float(i) - textureSlot) < threshold) {
			return texture2D(textures[i], vTexturePoint);
		}
	}
	return texture2D(textures[0], vTexturePoint);
}

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 alterHueSatLum(vec4 color, vec3 vHSV) {
    vec3 fragRGB = color.rgb;
    vec3 fragHSV = rgb2hsv(fragRGB).xyz;
    fragHSV.x += vHSV.x;
    fragHSV.yz *= vHSV.yz;
    fragRGB = hsv2rgb(fragHSV);
    return vec4(fragRGB, color.a);
}