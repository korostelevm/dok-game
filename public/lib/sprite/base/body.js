class Body extends Active {
	constructor(data, time, engine) {
		super();
		this.engine = engine;
		this.data = data;
		this.x = data.x || 0;
		this.y = data.y || 0;
		this.z = data.z || 0;
		this.positionCache = [this.x, this.y, this.z];
		this.motion = [... data.motion || [0, 0, 0]];
		this.motionCache = [this.motion[0], this.motion[1], this.motion[2]];
		this.acceleration = [... data.acceleration || [0, 0, 0]];
		this.updated = {
			motion: time,
			positionCache: 0,
			motionCache: 0,
		};
		this.followers = new Set();
		this.mouseListeners = null;
		this.hasMotion = false;
		this.hasAcceleration = false;
		this.updateFlag = 0xFFFFFFFF;
	}

	changeActive(value) {
		if (super.changeActive(value)) {
			this.updateFlag |= Constants.UPDATE_FLAG.ACTIVE;
			this.onMotionChanged(this.engine.time);
			return true;
		}
		return false;
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
			this.getRealPosition(time, true);
			this.updateFlag |= Constants.UPDATE_FLAG.SPRITE;
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
			follower.adjustFollowerPosition(time);	
		}
		this.hasMotion = this.motion[0]||this.motion[1]||this.motion[2];
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
			follower.adjustFollowerPosition(time);	
		}
		this.hasAcceleration = this.acceleration[0]||this.acceleration[1]||this.acceleration[2];
		this.hasMotion = this.hasAcceleration||this.motion[0]||this.motion[1]||this.motion[2];
	}

	getRealPosition(t, force) {
		const time = t || this.engine.lastTime;
		if (this.updated.positionCache === time) {
			return this.positionCache;
		}
		if (!this.hasMotion && !force) {
			return this.positionCache;
		}
		const dt = (time - this.updated.motion) / 1000;
		const dt2half = dt * dt / 2;
		this.positionCache[0] = this.x + this.motion[0] * dt + dt2half * this.acceleration[0];
		this.positionCache[1] = this.y + this.motion[1] * dt + dt2half * this.acceleration[1];
		this.positionCache[2] = this.z + this.motion[2] * dt + dt2half * this.acceleration[2];
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
			if (this.hasMotion) {
				const realPosition = this.getRealPosition(time);
				const x = realPosition[0];
				const y = realPosition[1];
				const z = realPosition[2];
				this.changePosition(x, y, z, time, true);
				this.updated.motion = time;
				this.updateFlag |= Constants.UPDATE_FLAG.MOTION;
			}

			if (this.hasAcceleration) {
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
			this.onRefresh = null;
			this.engine.refresher.delete(this);
		}
		if (target) {
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
		} else {
			this.following = null;
		}
	}

	adjustFollowerPosition(time) {
		this.recalculatePosition(time);
		const target = this.following.target;
		const offset = this.following.offset;
		const followAxis = this.following.followAxis;
		const targetPosition = target.getRealPosition(time);
		this.changePosition(
			followAxis[0] ? targetPosition[0] + offset.x : this.x,
			followAxis[1] ? targetPosition[1] + offset.y : this.y,
			followAxis[2] ? targetPosition[2] + offset.z : this.z,
			time);
		this.changeMotion(
			followAxis[0] ? target.motion[0] : this.motion[0],
			followAxis[1] ? target.motion[1] : this.motion[1],
			followAxis[2] ? target.motion[2] : this.motion[2],
			time);
		this.changeAcceleration(
			followAxis[0] ? target.acceleration[0] : this.acceleration[0],
			followAxis[1] ? target.acceleration[1] : this.acceleration[1],
			followAxis[2] ? target.acceleration[2] : this.acceleration[2],
			time);
	}

	addMouseListener(listener) {
		this.setupMouseListener();
		this.mouseListeners.add(listener);
	}

	setupMouseListener() {
		if (!this.handleMouse) {
			this.mouseListeners = new Set();
			this.handleMouse = (e, x, y)  => {
				for (let listener of this.mouseListeners) {
					listener.handleMouse(e, x, y);
				}
			}
		}
	}

	clear() {
		super.clear();
		this.followers.clear();
		if (this.mouseListeners) {
			this.mouseListeners.clear();
			this.mouseListeners = null;
		}
	}
}