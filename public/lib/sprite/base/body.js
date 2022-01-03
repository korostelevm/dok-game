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
		this.canRecalculatePosition = false;
		this.canRecalculateMotion = false;
	}

	changePosition(x, y, z, t, skipRecalculate) {
		if (this.x !== x || this.y !== y || this.z !== z) {
			const time = t || this.engine.lastTime;
			if (!skipRecalculate) {
				this.recalculatePosition(time);
			}
			this.x = x;
			this.y = y;
			this.z = z;
			this.followers.forEach(follower => follower.adjustFollowerPosition(time));
			return true;
		}
		return false;
	}

	changeMotion(dx, dy, dz, t, skipRecalculate) {
		if (this.motion[0] !== dx || this.motion[1] !== dy || this.motion[2] !== dz) {
			const time = t || this.engine.lastTime;
			if (!skipRecalculate) {
				this.recalculatePosition(time);
			}
			this.motion[0] = dx;
			this.motion[1] = dy;
			this.motion[2] = dz;
			this.onMotionChanged(time);
			return true;
		}
		return false;
	}

	onMotionChanged(time) {
		this.updated.motion = time;
		this.followers.forEach(follower => follower.followMotion(time));
		this.canRecalculatePosition = this.canRecalculateMotion||this.motion[0]||this.motion[1]||this.motion[2];
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

	changeAcceleration(ax, ay, az, t) {
		if (this.acceleration[0] !== ax || this.acceleration[1] !== ay || this.acceleration[2] !== az) {
			const time = t || this.engine.lastTime;
			this.recalculatePosition(time);
			this.acceleration[0] = ax;
			this.acceleration[1] = ay;
			this.acceleration[2] = az;
			this.onAccelerationChanged(time);
			return true;
		}
		return false;
	}

	onAccelerationChanged(time) {
		this.updated.motion = time;
		this.followers.forEach(follower => follower.followAcceleration(time));
		this.canRecalculateMotion = this.acceleration[0]||this.acceleration[1]||this.acceleration[2];
		this.canRecalculatePosition = this.canRecalculateMotion||this.motion[0]||this.motion[1]||this.motion[2];
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
		this.motionCache[0] = this.motion[0] + dt * this.acceleration[0];
		this.motionCache[1] = this.motion[1] + dt * this.acceleration[1];
		this.motionCache[2] = this.motion[2] + dt * this.acceleration[2];
		this.updated.motionCache = time;
		return this.motionCache;		
	}

	recalculatePosition(t) {
		const time = t || this.engine.lastTime;
		if (this.updated.motion !== time) {
			if (this.canRecalculatePosition) {
				const positionCache = this.getRealPosition(time);
				const x = positionCache[0];
				const y = positionCache[1];
				const z = positionCache[2];
				this.changePosition(x, y, z, time, true);
				this.updated.motion = time;
			}

			if (this.canRecalculateMotion) {
				const motionCache = this.getRealMotion(time);
				const vx = motionCache[0];
				const vy = motionCache[1];
				const vz = motionCache[2];
				this.changeMotion(vx, vy, vz, time, true);
				this.updated.motion = time;
			}
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