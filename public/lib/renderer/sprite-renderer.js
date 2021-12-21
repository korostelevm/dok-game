const ANIM_INDEX = 0;
const MOTION_INDEX = 1;

class SpriteRenderer {
	constructor(bufferRenderer, shader, size) {
		this.attributes = shader.attributes;
		this.uniforms = shader.uniforms;
		this.bufferRenderer = bufferRenderer;
		this.size = size;
		this.tempMatrix = new Float32Array(16);
		this.tempQuat = quat.create();
		this.tempTranslation = vec3.create();
		this.tempScale = vec3.create();
		this.tempOrigin = vec3.create();
		this.tempMotion = vec4.create();
		this.updateTimes = new Float32Array([0, 0, 0, 0]);
		this.alter = -400;
	}

	makeMatrix(x, y, z, width, height, hotX, hotY, rotation) {
		const [viewportWidth, viewportHeight] = this.size;
		return mat4.fromRotationTranslationScaleOrigin(
			this.tempMatrix,
			quat.fromEuler(this.tempQuat, rotation[0], rotation[1], rotation[2]),
			vec3.set(this.tempTranslation, (x * 2 - viewportWidth), -(y * 2 - viewportHeight), z),
			vec3.set(this.tempScale, width, height, 1),
			vec3.set(this.tempOrigin, (hotX - width/2) / width * 2, -(hotY - height/2) / height * 2, 0)
		);		
	}

	setAttributeSprite(index, x, y, z, width, height, hotX, hotY, rotation, cropX, cropY) {
		const attribute = this.attributes.matrix;
		const mat = this.makeMatrix(x, y, z + this.alter, width * (cropX || 1), height * (cropY || 1), hotX, hotY, rotation);
		this.bufferRenderer.setAttribute(attribute, index, mat);
	}

	setMotion(index, motion, acceleration) {
		const attribute = this.attributes.motion;
		this.tempMotion[0] = motion[0];
		this.tempMotion[1] = motion[1];
		this.tempMotion[2] = motion[2];
//		this.bufferRenderer.setAttribute(this.attributes.motion, index, this.tempMotion);
	}

	setAnimation(index, anim, direction, vdirection, opacity, cropX, cropY) {
		const attributes = this.attributes;
		if (anim) {
			this.bufferRenderer.setAttributeByte(attributes.textureIndex, index, anim.index);
			this.bufferRenderer.setAttribute(attributes.textureCoordinates, index, anim.getTextureCoordinates(direction, vdirection, opacity, cropX, cropY));
			this.bufferRenderer.setAttribute(attributes.animationInfo, index, anim.getAnimationInfo());
			this.bufferRenderer.setAttribute(attributes.spriteSheet, index, anim.getSpritesheetInfo());
		}
	}

	setUpdateTime(index, animationTime) {
		const attributes = this.attributes;
		this.updateTimes[ANIM_INDEX] = animationTime;
		this.bufferRenderer.setAttribute(attributes.updateTime, index, this.updateTimes);
	}

	setHud(index, isHud) {
		const attributes = this.attributes;
		this.bufferRenderer.setAttributeByte(attributes.isHud, index, isHud);		
	}
}