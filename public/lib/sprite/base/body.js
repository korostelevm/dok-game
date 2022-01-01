class Body {
	constructor(data, time, engine) {
		this.engine = engine;
		this.data = data;
		this.x = data.x || 0;
		this.y = data.y || 0;
		this.z = data.z || 0;
		this.positionCache = [this.x, this.y, this.z];
		this.cacheUpdateTime = 0;
		this.active = true;
		this.motion = [... data.motion || [0, 0, 0]];
		this.acceleration = [... data.acceleration || [0, 0, 0]];
		this.updated = {
			motion: time,
			active: time,
		};
		this.followers = new Set();
	}


	changePosition(x, y, z, time, skipRecalculate) {
		if (this.x !== x || this.y !== y || this.z !== z) {
			if (!skipRecalculate) {
				this.recalculatePosition(time || this.engine.lastTime);				
			}
			this.x = x;
			this.y = y;
			this.z = z;
			this.followers.forEach(follower => follower.adjustFollowerPosition(time));
			return true;
		}
		return false;
	}

	changeMotion(dx, dy, dz, time, skipRecalculate) {
		if (this.motion[0] !== dx || this.motion[1] !== dy || this.motion[2] !== dz) {
			if (!skipRecalculate) {
				this.recalculatePosition(time || this.engine.lastTime);
			}
			this.motion[0] = dx;
			this.motion[1] = dy;
			this.motion[2] = dz;
			this.cacheUpdateTime = 0;
			this.updated.motion = time || this.engine.lastTime;
			this.followers.forEach(follower => follower.changeMotion(dx, dy, dz, time));
			return true;
		}
		return false;
	}

	changeAcceleration(ax, ay, az, time) {
		if (this.acceleration[0] !== ax || this.acceleration[1] !== ay || this.acceleration[2] !== az) {
			this.recalculatePosition(time);
			this.acceleration[0] = ax;
			this.acceleration[1] = ay;
			this.acceleration[2] = az;
			this.cacheUpdateTime = 0;
			this.updated.motion = time || this.engine.lastTime;
			this.followers.forEach(follower => follower.changeAcceleration(ax, ay, az, time));
			return true;
		}
		return false;
	}

	changeActive(value, time) {
		if (this.active !== value) {
			this.active = value;
			this.updated.active = time || this.engine.lastTime;
			return true;
		}
		return false;
	}

	getRealPosition(t) {
		const time = t || this.engine.lastTime;
		if (this.cacheUpdateTime === time) {
			return this.positionCache;
		}
		const dt = (time - this.updated.motion) / 1000;
		const dt2 = dt * dt;
		this.positionCache[0] = this.x + this.motion[0] * dt + .5 * dt2 * this.acceleration[0];
		this.positionCache[1] = this.y + this.motion[1] * dt + .5 * dt2 * this.acceleration[1];
		this.positionCache[2] = this.z + this.motion[2] * dt + .5 * dt2 * this.acceleration[2];
		this.cacheUpdateTime = time;
		return this.positionCache;
	}

	recalculatePosition(t) {
		const time = t || this.engine.lastTime;
		if (this.updated.motion !== time) {
			const dt = (time - this.updated.motion) / 1000;
			const dt2 = dt * dt;
			const position = this.getRealPosition(time);
			const x = position[0];
			const y = position[1];
			const z = position[2];
			const vx = this.motion[0] + dt * this.acceleration[0];
			const vy = this.motion[1] + dt * this.acceleration[1];
			const vz = this.motion[2] + dt * this.acceleration[2];
			this.changePosition(x, y, z, time, true);
			this.changeMotion(vx, vy, vz, time, true);
			this.updated.motion = time;
		}
	}

	follow(target, offsetX, offsetY, offsetZ) {
		if (this.following) {
			if (this.following.target === target) {
				return;
			}
			this.following.target.followers.delete(this);
		}
		this.following = {
			target,
			offsetX: offsetX ?? this.x - target.x,
			offsetY: offsetY ?? this.y - target.y,
			offsetZ: offsetZ ?? this.z - target.z,
		};
		target.followers.add(this);
	}

	adjustFollowerPosition(time) {
		const { target, offsetX, offsetY, offsetZ } = this.following;
		this.changePosition(target.x + offsetX, target.y + offsetY, target.z + offsetZ, time);
	}
}