class GameRing extends GameBase {
	moveMazoos(time) {
		const gl = engine.gl;
		const config = engine.config;
		const viewportWidth = engine.viewportWidth;
		const viewportHeight = engine.viewportHeight;
		for (let mazoo of this.mazoos) {
			const goalX = mazoo.goal[0];
			const goalY = mazoo.goal[1];
			const dx = (goalX - mazoo.x);
			const dy = (goalY - mazoo.y);
			const dist = Math.max(1, Math.sqrt(dx*dx + dy*dy));
			const x = mazoo.x + dx / dist;
			const y = mazoo.y + dy / dist;
			const z = y / 400 * 100;
			mazoo.changePosition(x, y, z, time);
			if (dist <= 1) {
				if (!mazoo.stillTime) {
					mazoo.stillTime = time;
					mazoo.changeAnimation(this.atlas.mazoo_still, time);
				} else if (time - mazoo.stillTime > 5000) {
					mazoo.goal[0] = Math.random() * viewportWidth;
					mazoo.goal[1] = Math.random() * viewportHeight;
				}
			} else {
				mazoo.stillTime = 0;
				if (Math.abs(dx) >= Math.abs(dy)) {
					mazoo.changeAnimation(dx < 0 ? this.atlas.mazoo_left : this.atlas.mazoo_right, time);
				} else {
					mazoo.changeAnimation(dy < 0 ? this.atlas.mazoo_up : this.atlas.mazoo_down, time);
				}
			}
		}
	}

	refresh(time, dt) {
		this.moveMazoos(time);
	}
}