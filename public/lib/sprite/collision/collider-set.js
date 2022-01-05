class ColliderSet {
	constructor(sprite) {
		this.collideTimes = {};
		this.sprite = sprite;
	}

	track(sprite, time) {
		if (!this.collideTimes[sprite.id]) {
			this.sprite.game.engine.refresher.add(this);			
		}
		this.collideTimes[sprite.id] = time;
	}

	onRefresh(self, time) {
		let collisionsLeft = false;
		for (let spriteId in this.collideTimes) {
			const lastCollide = this.collideTimes[spriteId];
			if (time !== lastCollide) {
				this.sprite.onStopCollision(self.sprite, spriteId);
				delete this.collideTimes[spriteId];
			} else {
				collisionsLeft = true;
			}
		}
		if (!collisionsLeft) {
			this.sprite.game.engine.refresher.delete(this);
		}
	}
}