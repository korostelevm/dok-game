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
	}

	makeMatrix(x, y, width, height, hotX, hotY, degreeRotation) {
		const [viewportWidth, viewportHeight] = this.size;
		return mat4.fromRotationTranslationScaleOrigin(
			this.tempMatrix,
			quat.fromEuler(this.tempQuat, 0, 0, degreeRotation || 0),
			vec3.set(this.tempTranslation, (x * 2 - viewportWidth), -(y * 2 - viewportHeight), 0),
			vec3.set(this.tempScale, width, height, 1),
			vec3.set(this.tempOrigin, (hotX - width/2) / width * 2, -(hotY - height/2) / height * 2, 0)
		);		
	}

	setAttributeSprite(index, x, y, width, height, hotX, hotY, degreeRotation) {
		const attribute = this.attributes.matrix;
		const mat = this.makeMatrix(x, y, width, height, hotX, hotY, degreeRotation);
		this.bufferRenderer.setAttribute(attribute, index, mat);
	}

	setAnimation(index, anim, direction, opacity, time) {
		const { attributes } = this;
		this.bufferRenderer.setAttributeByte(attributes.textureIndex, index, anim.index);
		this.bufferRenderer.setAttribute(attributes.textureCoordinates, index, anim.getTextureCoordinates(direction, opacity));
		this.bufferRenderer.setAttribute(attributes.animationInfo, index, anim.getAnimationInfo(time));
		this.bufferRenderer.setAttribute(attributes.spriteSheet, index, anim.getSpritesheetInfo());
	}
}