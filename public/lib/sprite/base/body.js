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
		const dx = x - this.x;
		const dy = y - this.y;
		const dz = z - this.z;
		return this.movePosition(dx, dy, dz, time, skipRecalculate);
	}

	movePosition(dx, dy, dz, time, skipRecalculate) {
		if (dx !== 0 || dy !== 0 || dz !== 0) {
			if (!skipRecalculate) {
				this.recalculatePosition(time || this.engine.lastTime);				
			}
			this.x += dx;
			this.y += dy;
			this.z += dz;
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

	follow(sprite) {
		sprite.followers.add(this);
	}
}