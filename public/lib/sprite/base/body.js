class Body {
	constructor(data, time, engine) {
		this.engine = engine;
		this.data = data;
		this.x = data.x || 0;
		this.y = data.y || 0;
		this.z = data.z || 0;
		this.positionCache = [this.x, this.y, this.z];
		this.active = true;
		this.motion = [... data.motion || [0, 0, 0]];
		this.motionCache = [this.motion[0], this.motion[1], this.motion[2]];
		this.acceleration = [... data.acceleration || [0, 0, 0]];
		this.updated = {
			motion: time,
			active: time,
			positionCache: 0,
			motionCache: 0,
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
			this.followers.forEach(follower => follower.followMotion(time));
			return true;
		}
		return false;
	}

	followMotion(time) {
		this.recalculatePosition(time);
		const { target, followAxis } = this.following;
		this.changeMotion(
			followAxis[0] ? target.motion[0] : this.motion[0],
			followAxis[1] ? target.motion[1] : this.motion[1],
			followAxis[2] ? target.motion[2] : this.motion[2],
			time);
	}

	changeAcceleration(ax, ay, az, time) {
		if (this.acceleration[0] !== ax || this.acceleration[1] !== ay || this.acceleration[2] !== az) {
			this.recalculatePosition(time);
			this.acceleration[0] = ax;
			this.acceleration[1] = ay;
			this.acceleration[2] = az;
			this.cacheUpdateTime = 0;
			this.updated.motion = time || this.engine.lastTime;
			this.followers.forEach(follower => follower.followAcceleration(time));
			return true;
		}
		return false;
	}

	followAcceleration(time) {
		this.recalculatePosition(time);
		const { target, followAxis } = this.following;
		this.changeAcceleration(
			followAxis[0] ? target.acceleration[0] : this.acceleration[0],
			followAxis[1] ? target.acceleration[1] : this.acceleration[1],
			followAxis[2] ? target.acceleration[2] : this.acceleration[2],
			time);
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
		if (this.updated.positionCache === time) {
			return this.positionCache;
		}
		const dt = (time - this.updated.motion) / 1000;
		const dt2 = dt * dt;
		this.positionCache[0] = this.x + this.motion[0] * dt + .5 * dt2 * this.acceleration[0];
		this.positionCache[1] = this.y + this.motion[1] * dt + .5 * dt2 * this.acceleration[1];
		this.positionCache[2] = this.z + this.motion[2] * dt + .5 * dt2 * this.acceleration[2];
		this.updated.positionCache = time;
		return this.positionCache;
	}

	getRealMotion(t) {
		const time = t || this.engine.lastTime;
		if (this.updated.motionCache === time) {
			return this.motionCache;
		}
		const dt = (time - this.updated.motion) / 1000;
		this.motionCache[0] = dt * this.acceleration[0];
		this.motionCache[1] = dt * this.acceleration[1];
		this.motionCache[2] = dt * this.acceleration[2];
		this.updated.motionCache = time;
		return this.motionCache;		
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

	follow(target, offset, followAxis) {
		if (this.following) {
			if (this.following.target === target) {
				return;
			}
			this.following.target.followers.delete(this);
		}
		this.following = {
			target,
			offset: {
				x: offset?.x ?? this.x - target.x,
				y: offset?.y ?? this.y - target.y,
				z: offset?.z ?? this.z - target.z,
			},
			followAxis: followAxis || [true, true, true],
		};
		target.followers.add(this);
	}

	adjustFollowerPosition(time) {
		this.recalculatePosition(time);
		const { target, offset, followAxis } = this.following;
		this.changePosition(
			followAxis[0] ? target.x + offset.x : this.x,
			followAxis[1] ? target.y + offset.y : this.y,
			followAxis[2] ? target.z + offset.z : this.z, time);
	}
}