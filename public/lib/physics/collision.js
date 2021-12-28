const HORIZONTAL = 0, VERTICAL = 1, DEEP = 2;

class Collision extends PhysicsBase {
	constructor(horizontal, vertical, deep) {
		super();
		this.H = 1 << HORIZONTAL;
		this.V = 1 << VERTICAL;
		this.D = 1 << DEEP;

		this.BOTH = (horizontal ? this.H : 0) | (vertical ? this.V : 0) | (deep ? this.D : 0);
		this.countType = [horizontal, vertical, deep];
	}

	async init(sprites, game) {
		this.game = game;
		this.sprites = sprites.filter(({collide}) => collide);
		this.horizontal = [];
		this.vertical = [];
		this.deep = [];
		this.axis = [
			this.horizontal,
			this.vertical,
			this.deep,
		];
		this.openColliders = [];
		this.countedColliders = [];

		this.sprites.forEach((sprite, colIndex) => {
			const topLeftClose = { sprite, topLeftClose: true, bottomRightFar: false, x: 0, y: 0, z: 0 };
			const bottomRightFar = { sprite, topLeftClose: false, bottomRightFar: true, x: 0, y: 0, z: 0 };
			if (this.countType[HORIZONTAL]) {
				this.horizontal.push(topLeftClose, bottomRightFar);
			}
			if (this.countType[VERTICAL]) {
				this.vertical.push(topLeftClose, bottomRightFar);
			}
			if (this.countType[DEEP]) {
				this.deep.push(topLeftClose, bottomRightFar);
			}
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

	countCollision(sprite, secondSprite, type) {
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
		collisions[colIndex] |= 1 << type; 
	}

	calculateCollisionMarkers(time) {
		for (let i = 0; i < this.sprites.length; i++) {
			this.sprites[i].getCollisionBox(time);
		}
		for (let i = 0; i < this.horizontal.length; i++) {
			const marker = this.horizontal[i];
			marker.x = (marker.topLeftClose ?  marker.sprite.collisionBox.left : marker.sprite.collisionBox.right);
		}
		for (let i = 0; i < this.vertical.length; i++) {
			const marker = this.vertical[i];
			marker.y = (marker.topLeftClose ?  marker.sprite.collisionBox.top : marker.sprite.collisionBox.bottom);
		}
		for (let i = 0; i < this.deep.length; i++) {
			const marker = this.deep[i];
			marker.z = (marker.topLeftClose ?  marker.sprite.collisionBox.close : marker.sprite.collisionBox.far);
		}
		ArrayUtils.sort(this.horizontal, this.compareHorizontal);
		ArrayUtils.sort(this.vertical, this.compareVertical);
		ArrayUtils.sort(this.deep, this.compareDepth);
	}

	refresh(time, dt) {
		for (let i = 0; i < this.sprites.length; i++) {
			if (this.sprites[i].preCollisionCheck) {
				this.sprites[i].preCollisionCheck(this.sprites[i]);
			}
		}
		this.calculateCollisionMarkers(time);
		for (let m = 0; m < this.axis.length; m++) {
			const markers = this.axis[m];
			for (let i = 0; i < markers.length; i++) {
				const marker = markers[i];
				const sprite = marker.sprite;
				if (sprite.disabled) {
					continue;
				}

				this.countNewCollisionsWithOpenColliders(sprite, m);

				if (marker.topLeftClose) {
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

	countNewCollisionsWithOpenColliders(sprite, type) {
		const openColliders = this.openColliders;
		for (let i = 0; i < openColliders.length; i++) {
			const openCollider = openColliders[i];
			if (openCollider.id !== sprite.id) {
				this.countCollision(openCollider, sprite, type);
			}
		}
		if (sprite.collisionData.countCollision) {
			for (let i = 0; i < openColliders.length; i++) {
				const openCollider = openColliders[i];
				if (openCollider.id !== sprite.id) {
					this.countCollision(sprite, openCollider, type);
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
		const closePush = sprite.collisionBox.far - secondSprite.collisionBox.close;
		const farPush = secondSprite.collisionBox.far - sprite.collisionBox.close;
		const zPush = closePush < farPush ? -closePush : farPush;
		if (sprite.onCollide) {
			sprite.onCollide(sprite, secondSprite, xPush, yPush, zPush);
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

	compareDepth(a, b) {
		return a.z - b.z;
	}
}