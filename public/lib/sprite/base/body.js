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
			positionCache: 0,
			motionCache: 0,
		};
		this.updateFlag = 0xFFFFFFFF;
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
			for (let follower of this.followers) {
				follower.adjustFollowerPosition(time);	
			}
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
		this.updateFlag |= Constants.UPDATE_FLAG.MOTION;
		for (let follower of this.followers) {
			follower.followMotion(time);
		}
		this.canRecalculatePosition = this.canRecalculateMotion||this.motion[0]||this.motion[1]||this.motion[2];
	}

	followMotion(time) {
		this.recalculatePosition(time);
		const target = this.following.target;
		const followAxis = this.following.followAxis;
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
		this.updateFlag |= Constants.UPDATE_FLAG.MOTION;
		for (let follower of this.followers) {
			follower.followAcceleration(time);	
		}
		this.canRecalculateMotion = this.acceleration[0]||this.acceleration[1]||this.acceleration[2];
		this.canRecalculatePosition = this.canRecalculateMotion||this.motion[0]||this.motion[1]||this.motion[2];
	}

	followAcceleration(time) {
		this.recalculatePosition(time);
		const target = this.following.target;
		const followAxis = this.following.followAxis;
		this.changeAcceleration(
			followAxis[0] ? target.acceleration[0] : this.acceleration[0],
			followAxis[1] ? target.acceleration[1] : this.acceleration[1],
			followAxis[2] ? target.acceleration[2] : this.acceleration[2],
			time);
	}

	changeActive(value) {
		if (this.active !== value) {
			this.active = value;
			this.updateFlag |= Constants.UPDATE_FLAG.ACTIVE;
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
				const realPosition = this.getRealPosition(time);
				const x = realPosition[0];
				const y = realPosition[1];
				const z = realPosition[2];
				this.changePosition(x, y, z, time, true);
				this.updated.motion = time;
				this.updateFlag |= Constants.UPDATE_FLAG.MOTION;
			}

			if (this.canRecalculateMotion) {
				const realMotion = this.getRealMotion(time);
				const vx = realMotion[0];
				const vy = realMotion[1];
				const vz = realMotion[2];
				this.changeMotion(vx, vy, vz, time, true);
				this.updated.motion = time;
				this.updateFlag |= Constants.UPDATE_FLAG.MOTION;
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
		const target = this.following.target;
		const offset = this.following.offset;
		const followAxis = this.following.followAxis;
		this.changePosition(
			followAxis[0] ? target.x + offset.x : this.x,
			followAxis[1] ? target.y + offset.y : this.y,
			followAxis[2] ? target.z + offset.z : this.z, time);
	}

	destroy() {
		this.changeActive(false);
		this.destroyed = true;
	}
}