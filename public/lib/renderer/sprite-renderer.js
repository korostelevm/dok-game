const ANIM_INDEX = 0;
const MOTION_INDEX = 1;

const MUL = 2;

class SpriteRenderer {
	constructor(gl, attributes) {
		this.bufferRenderer = new BufferRenderer(gl);
		this.attributes = attributes;
		this.tempMatrix = new Float32Array(16);
		this.tempQuat = quat.create();
		this.tempTranslation = vec3.create();
		this.tempScale = vec3.create();
		this.tempMotion = vec3.create();
		this.tempAcceleration = vec3.create();
		this.updateTimes = new Float32Array([0, 0, 0, 0]);
		this.alter = -400;
	}

	init() {
		this.bufferRenderer.setAttribute(this.attributes.vertexPosition, 0, Utils.FULL_VERTICES);
	}

	makeMatrix(x, y, z, width, height, hotX, hotY, rotation) {
		return mat4.fromRotationTranslationScale(
			this.tempMatrix,
			quat.fromEuler(this.tempQuat, rotation[0], rotation[1], rotation[2]),
			vec3.set(this.tempTranslation, x * MUL, -y * MUL, z * MUL),
			vec3.set(this.tempScale, width, height, 1)
		);
	}

	setAttributeSprite(index, x, y, z, width, height, hotX, hotY, rotation) {
		const attribute = this.attributes.matrix;
		const mat = this.makeMatrix(x, y, z + this.alter, width, height, hotX * width, hotY * height, rotation);
		this.bufferRenderer.setAttribute(attribute, index, mat);
	}

	setMotion(index, motion, acceleration) {
		this.tempMotion[0] = motion[0] * MUL;
		this.tempMotion[1] = -motion[1] * MUL;
		this.tempMotion[2] = motion[2] * MUL;
		this.bufferRenderer.setAttribute(this.attributes.motion, index, this.tempMotion);
		this.tempAcceleration[0] = acceleration[0] * MUL;
		this.tempAcceleration[1] = -acceleration[1] * MUL;
		this.tempAcceleration[2] = acceleration[2] * MUL;
		this.bufferRenderer.setAttribute(this.attributes.acceleration, index, this.tempAcceleration);
	}

	setTextureIndex(index, animIndex, opacity, light, spriteType) {
		this.bufferRenderer.setAttributeByte4(this.attributes.textureIndex, index, animIndex, light * 128, opacity * 128, spriteType);
	}

	setAnimationInfo(index, anim, direction, vdirection) {
		const attributes = this.attributes;
		if (anim) {
			this.bufferRenderer.setAttribute(attributes.textureCoordinates, index, anim.getTextureCoordinates(direction, vdirection));
			this.bufferRenderer.setAttribute(attributes.animationInfo, index, anim.getAnimationInfo());
			this.bufferRenderer.setAttribute(attributes.spriteSheet, index, anim.getSpritesheetInfo());
		}
	}

	setUpdateTime(index, animationTime, motionTime) {
		const attributes = this.attributes;
		this.updateTimes[ANIM_INDEX] = animationTime;
		this.updateTimes[MOTION_INDEX] = motionTime;
		this.bufferRenderer.setAttribute(attributes.updateTime, index, this.updateTimes);
	}
}