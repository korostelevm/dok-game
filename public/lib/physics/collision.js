class Collision extends PhysicsBase {
	async init(sprites, game) {
		this.game = game;
		this.sprites = sprites.filter(({collide}) => collide);
		this.horizontal = [];
		this.vertical = [];
		this.axis = [
			this.horizontal,
			this.vertical,
		];
		this.openColliders = {};

		this.H = 1;
		this.V = 2;
		this.BOTH = this.H | this.V;

		this.sprites.forEach((sprite, colIndex) => {
			const topLeft = { sprite, topLeft: true };
			const bottomRight = { sprite, bottomRight: true };
			this.horizontal.push(topLeft, bottomRight);
			this.vertical.push(topLeft, bottomRight);
			sprite.collisionData = {
				colIndex,
				colliders: [],
				collisions: new Array(this.sprites.length).fill(null).map(() => 0),
				overlappers: [],
				overlapping: new Array(this.sprites.length).fill(null).map(() => 0),
			};
		});
	}

	countCollision(sprite, index, horizontal) {
		const { collisions, colliders } = sprite.collisionData;
		if (!collisions[index]) {
			colliders.push(index);
		}
		collisions[index] |= horizontal ? this.H : this.V; 
	}

	refresh(time, dt) {
		for (let i = 0; i < this.sprites.length; i++) {
			this.sprites[i].getCollisionBox(time);
		}

		this.horizontal.sort(this.compareHorizontal);
		this.vertical.sort(this.compareVertical);

		for (let m = 0; m < this.axis.length; m++) {
			const openColliders = this.openColliders;
			const ax = this.axis[m];
			for (let i = 0; i < ax.length; i++) {
				const { sprite, topLeft, bottomRight } = ax[i];
				if (sprite.disabled) {
					continue;
				}

				//	Count new collisions with the open colliders
				for (let id in openColliders) {
					const openCollider = openColliders[id];
					if (id !== sprite.id) {
						if (openCollider.onCollide) {
							this.countCollision(openCollider, sprite.collisionData.colIndex, m === 0);
						}
						if (sprite.onCollide) {
							this.countCollision(sprite, openCollider.collisionData.colIndex, m === 0);
						}
					}
				}

				if (topLeft) {
					//	Open the new colliders
					openColliders[sprite.id] = sprite;
				} else {
					//	Close colliders
					delete openColliders[sprite.id];
				}
			}
		}
		this.applyCollisionsOnAllSprites(time);
	}

	accountForCollision(sprite, secondSprite, time) {
		const leftPush = sprite.collisionBox.right - secondSprite.collisionBox.left;
		const rightPush = secondSprite.collisionBox.right - sprite.collisionBox.left;
		const xPush = leftPush < rightPush ? -leftPush : rightPush;
		const topPush = sprite.collisionBox.bottom - secondSprite.collisionBox.top;
		const bottomPush = secondSprite.collisionBox.bottom - sprite.collisionBox.top;
		const yPush = topPush < bottomPush ? -topPush : bottomPush;
		if (sprite.onCollide) {
			sprite.onCollide(sprite, secondSprite, xPush, yPush);
		}
		if (!sprite.collisionData.overlapping[secondSprite.collisionData.colIndex]) {
			if (sprite.onEntering) {
				sprite.onEntering(sprite, secondSprite);
			}
			sprite.collisionData.overlappers.push(secondSprite.collisionData.colIndex);
		}
		sprite.collisionData.overlapping[secondSprite.collisionData.colIndex] = time;
	}

	applyCollisionsOnAllSprites(time) {
		for (let i = 0; i < this.sprites.length; i++) {
			this.applyCollisions(this.sprites[i], time);
		}
		for (let i = 0; i < this.sprites.length; i++) {
			this.leaveCollisions(this.sprites[i], time);
		}
	}

	applyCollisions(sprite, time) {
		for (let i = 0; i < sprite.collisionData.colliders.length; i++) {
			const index = sprite.collisionData.colliders[i];
			const secondSprite = this.sprites[index];
			if (sprite.collisionData.collisions[secondSprite.collisionData.colIndex] === this.BOTH) {
				this.accountForCollision(sprite, secondSprite, time);
			}
			sprite.collisionData.collisions[secondSprite.collisionData.colIndex] = 0;
		}
		sprite.collisionData.colliders.length = 0;
	}

	leaveCollisions(sprite, time) {
		const { overlappers, overlapping } = sprite.collisionData;
		for (let i = overlappers.length - 1; i >= 0; i--) {
			const overlapperIndex = overlappers[i];
			if (overlapping[overlapperIndex] !== time) {
				overlapping[overlapperIndex] = 0;
				overlappers[i] = overlappers[overlappers.length - 1];
				overlappers.pop();
				if (sprite.onLeaving) {
					sprite.onLeaving(sprite, this.sprites[overlapperIndex]);
				}
			}
		}
	}

	compareHorizontal(a, b) {
		const aX = a.topLeft ? a.sprite.collisionBox.left : a.sprite.collisionBox.right;
		const bX = b.topLeft ? b.sprite.collisionBox.left : b.sprite.collisionBox.right;
		return aX - bX;
	}

	compareVertical(a, b) {
		const aY = a.topLeft ? a.sprite.collisionBox.top : a.sprite.collisionBox.bottom;
		const bY = b.topLeft ? b.sprite.collisionBox.top : b.sprite.collisionBox.bottom;
		return aY - bY;
	}
}