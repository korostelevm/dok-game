class Shift {
	constructor() {
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.zoom = 1;
		this.opacity = 1;
		this.rotation = [0, 0, 0];
		this.goal = {
			x:0, y:0, z:0,
			zoom:1, opacity: 1, rotation:[0,0,0],
		};
		this.dirty = true;
		this.tempVec3 = vec3.create();
		this.viewMatrix = mat4.create();
	}

	turnLightOff() {
		this.goal.light = 0;
		this.light = 0;		
	}

	turnLightOn() {
		this.goal.light = 1;
	}

	clear() {
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.rotation[0] = 0;
		this.rotation[1] = 0;
		this.rotation[2] = 0;
		this.light = 0;
		this.zoom = 1;
		this.goal.x = 0;
		this.goal.y = 0;
		this.goal.z = 0;
		this.goal.zoom = 1;
		this.goal.light = 0;
		this.goal.rotation[0] = 0;
		this.goal.rotation[1] = 0;
		this.goal.rotation[2] = 0;
		this.dirty = true;
	}

	handleViewUpdate(time, shader, gl, render) {
		let shiftChanged = false;
		if (this.x !== this.goal.x
			|| this.y !== this.goal.y
			|| this.z !== this.goal.z
			|| this.zoom !== this.goal.zoom
			|| this.light !== this.goal.light
			|| this.rotation[0] !== this.goal.rotation[0]
			|| this.rotation[1] !== this.goal.rotation[1]
			|| this.rotation[2] !== this.goal.rotation[2]
			|| this.dirty) {
			const dx = (this.goal.x - this.x);
			const dy = (this.goal.y - this.y);
			const dz = (this.goal.z - this.z);
			const drx = (this.goal.rotation[0] - this.rotation[0]);
			const dry = (this.goal.rotation[1] - this.rotation[1]);
			const drz = (this.goal.rotation[2] - this.rotation[2]);
			const dzoom = (this.goal.zoom - this.zoom);
			const dlight = (this.goal.light - this.light);
			const dist = Math.sqrt(dx*dx + dy*dy + dz*dz + drx*drx + dry*dry + drz*drz + dzoom*dzoom + dlight*dlight);
			const speed = dist / 20;
			const mul = dist < .1 ? 1 : Math.min(speed, dist) / dist;
			this.x += dx * mul;
			this.y += dy * mul;
			this.z += dz * mul;
			this.rotation[0] += drx * mul;
			this.rotation[1] += dry * mul;
			this.rotation[2] += drz * mul;
			this.zoom += dzoom * mul;
			this.light += dlight * mul;
			this.dirty = false;
			shiftChanged = true;
		}

		const uniforms = shader.uniforms;
		let shakeX = 0, shakeY = 0;
		const shake = typeof(this.shake) === "function" ? this.shake(time) : this.shake;
		if (shake) {
			if (shake > 1) {
				shakeY = (Math.random() - .5) * shake;
			}
		} else if (shake === null && this.shake) {
			delete this.shake;
			shiftChanged = true;
		}

		if (render) {
			if (shiftChanged || shakeX || shakeY) {
				mat4.identity(this.viewMatrix);
				const coef = this.zoom;
				const coef2 = coef * coef;
				mat4.scale(this.viewMatrix, this.viewMatrix, vec3.set(this.tempVec3, coef, coef, 1));
				mat4.rotateX(this.viewMatrix, this.viewMatrix, this.rotation[0] * Constants.DEG_TO_RAD);
				mat4.rotateY(this.viewMatrix, this.viewMatrix, this.rotation[1] * Constants.DEG_TO_RAD);
				mat4.rotateZ(this.viewMatrix, this.viewMatrix, this.rotation[2] * Constants.DEG_TO_RAD);
				mat4.translate(this.viewMatrix, this.viewMatrix, vec3.set(this.tempVec3, this.x * coef2 + shakeX, -this.y * coef2 + shakeY, -this.z * coef2));
				gl.uniformMatrix4fv(uniforms.view.location, false, this.viewMatrix);
				gl.uniform1f(uniforms.globalLight.location, this.light);

				mat4.identity(this.viewMatrix);
				mat4.rotateX(this.viewMatrix, this.viewMatrix, -this.rotation[0] * Constants.DEG_TO_RAD);
				mat4.rotateY(this.viewMatrix, this.viewMatrix, -this.rotation[1] * Constants.DEG_TO_RAD);
				mat4.rotateZ(this.viewMatrix, this.viewMatrix, -this.rotation[2] * Constants.DEG_TO_RAD);
				gl.uniformMatrix4fv(uniforms.spriteMatrix.location, false, this.viewMatrix);
			}
		}
	}
}