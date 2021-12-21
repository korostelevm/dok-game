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
		this.openColliders = [];
		this.countedColliders = [];

		this.H = 1;
		this.V = 2;
		this.BOTH = this.H | this.V;

		this.sprites.forEach((sprite, colIndex) => {
			const topLeft = { sprite, topLeft: true, bottomRight: false, x: 0, y: 0 };
			const bottomRight = { sprite, topLeft: false, bottomRight: true, x: 0, y: 0 };
			this.horizontal.push(topLeft, bottomRight);
			this.vertical.push(topLeft, bottomRight);
			sprite.collisionData = {
				colIndex,
				colliders: [],
				collisions: new Array(this.sprites.length).fill(null).map(() => 0),
				overlappers: [],
				overlapping: new Array(this.sprites.length).fill(null).map(() => 0),
				countCollision: !!(sprite.onCollide || sprite.onLeave || sprite.onEnter),
				openColliderIndex: 0,
			};
		});

		this.perf = {
			count: 0,
			time: 0,
		};
	}

	countCollision(sprite, secondSprite, horizontal) {
		if (!sprite.collisionData.countCollision) {
			return;
		}
		const { colIndex } = secondSprite.collisionData;
		const { collisions, colliders } = sprite.collisionData;
		if (!collisions[colIndex]) {
			if (!colliders.length) {
				this.countedColliders.push(sprite);
			}
			colliders.push(colIndex);
		}
		collisions[colIndex] |= horizontal ? this.H : this.V; 
	}

	calculateCollisionMarkers(time) {
		for (let i = 0; i < this.sprites.length; i++) {
			this.sprites[i].getCollisionBox(time);
		}
		for (let i = 0; i < this.horizontal.length; i++) {
			const marker = this.horizontal[i];
			marker.x = (marker.topLeft ?  marker.sprite.collisionBox.left : marker.sprite.collisionBox.right);
		}
		for (let i = 0; i < this.vertical.length; i++) {
			const marker = this.vertical[i];
			marker.y = (marker.topLeft ?  marker.sprite.collisionBox.top : marker.sprite.collisionBox.bottom);
		}
		ArrayUtils.sort(this.horizontal, this.compareHorizontal);
		ArrayUtils.sort(this.vertical, this.compareVertical);
	}

	refresh(time, dt) {
		for (let i = 0; i < this.sprites.length; i++) {
			if (this.sprites[i].preCollisionCheck) {
				this.sprites[i].preCollisionCheck(this.sprites[i]);
			}
		}
		this.calculateCollisionMarkers(time);
		for (let m = 0; m < this.axis.length; m++) {
			const isHorizontal = m === 0;
			const ax = this.axis[m];
			for (let i = 0; i < ax.length; i++) {
				const marker = ax[i];
				const sprite = marker.sprite;
				if (sprite.disabled) {
					continue;
				}

				this.countNewCollisionsWithOpenColliders(sprite, isHorizontal);

				if (marker.topLeft) {
					//	Open the new colliders
					this.addOpenCollider(sprite);
				} else {
					//	Close colliders
					this.removeOpenCollider(sprite);
				}
			}
		}
		this.applyCollisionsOnAllSprites(time);
	}

	addOpenCollider(sprite) {
		const openColliders = this.openColliders;
		sprite.collisionData.openColliderIndex = openColliders.length;
		openColliders.push(sprite);
	}

	removeOpenCollider(sprite) {
		const openColliders = this.openColliders;
		const openColliderIndex = sprite.collisionData.openColliderIndex;
		openColliders[openColliderIndex] = openColliders[openColliders.length - 1];
		openColliders.pop();
		if (openColliderIndex < openColliders.length) {
			const replacement = openColliders[openColliderIndex];
			replacement.collisionData.openColliderIndex = openColliderIndex;
		}
	}

	countNewCollisionsWithOpenColliders(sprite, isHorizontal) {
		const openColliders = this.openColliders;
		for (let i = 0; i < openColliders.length; i++) {
			const openCollider = openColliders[i];
			if (openCollider.id !== sprite.id) {
				this.countCollision(openCollider, sprite, isHorizontal);
			}
		}
		if (sprite.collisionData.countCollision) {
			for (let i = 0; i < openColliders.length; i++) {
				const openCollider = openColliders[i];
				if (openCollider.id !== sprite.id) {
					this.countCollision(sprite, openCollider, isHorizontal);
				}
			}
		}
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
			if (sprite.onEnter) {
				sprite.onEnter(sprite, secondSprite);
			}
			sprite.collisionData.overlappers.push(secondSprite.collisionData.colIndex);
		}
		sprite.collisionData.overlapping[secondSprite.collisionData.colIndex] = time;
	}

	applyCollisionsOnAllSprites(time) {
		for (let i = 0; i < this.countedColliders.length; i++) {
			this.applyCollisions(this.countedColliders[i], time);
		}
		for (let i = 0; i < this.countedColliders.length; i++) {
			this.leaveCollisions(this.countedColliders[i], time);
		}
		this.countedColliders.length = 0;
	}

	applyCollisions(sprite, time) {
		const colliders = sprite.collisionData.colliders;
		for (let i = 0; i < colliders.length; i++) {
			const index = colliders[i];
			const secondSprite = this.sprites[index];
			if (sprite.collisionData.collisions[secondSprite.collisionData.colIndex] === this.BOTH) {
				this.accountForCollision(sprite, secondSprite, time);
			}
			sprite.collisionData.collisions[secondSprite.collisionData.colIndex] = 0;
		}
		colliders.length = 0;
	}

	leaveCollisions(sprite, time) {
		const { overlappers, overlapping } = sprite.collisionData;
		for (let i = overlappers.length - 1; i >= 0; i--) {
			const overlapperIndex = overlappers[i];
			if (overlapping[overlapperIndex] !== time) {
				overlapping[overlapperIndex] = 0;
				overlappers[i] = overlappers[overlappers.length - 1];
				overlappers.pop();
				if (sprite.onLeave) {
					sprite.onLeave(sprite, this.sprites[overlapperIndex]);
				}
			}
		}
	}

	compareHorizontal(a, b) {
		return a.x - b.x;
	}

	compareVertical(a, b) {
		return a.y - b.y;
	}
}