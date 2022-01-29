const HORIZONTAL = 0, VERTICAL = 1, DEEP = 2;

class Collision extends PhysicsBase {
	constructor({horizontal, vertical, deep}) {
		super();
		this.H = 1 << HORIZONTAL;
		this.V = 1 << VERTICAL;
		this.D = 1 << DEEP;

		this.BOTH = (horizontal ? this.H : 0) | (vertical ? this.V : 0) | (deep ? this.D : 0);
		this.temp = {
			openColliders: new Set(),
			countedColliders: new Set(),
			markers: [],
		};
		this.sortCallbacks = [
			this.compareHorizontal,
			this.compareVertical,
			this.compareDepth,
		];

		this.collisionDataList = new Map();
	}

	async init(sprites, game) {
		this.game = game;
		const filteredSprites = sprites.filter(({collide}) => collide);

		for (const sprite of filteredSprites) {
			this.addCollision(sprite);
		}
	}

	addCollision(sprite) {
		if (this.collisionDataList.has(sprite)) {
			return;
		}
		const collisionData = {
			sprite,
			collisionBox: sprite.collisionBox,
			collisions: new Map(),
			overlapping: new Map(),
			onCollide: sprite.onCollide,
			onLeave: sprite.onLeave,
			onEnter: sprite.onEnter,
			onSpriteActivation: (sprite, active) => {
				if (!active) {
					this.removeCollision(sprite);
					sprite.addActivationListener(collisionData.onReactivate);
				}
			},
			onReactivate: (sprite, active) => {
				if (active) {
					sprite.removeActivationListener(collisionData.onReactivate);
					this.addCollision(sprite);
				}
			},
		};
		collisionData.shouldCountCollision = !!(collisionData.onCollide || collisionData.onLeave || collisionData.onEnter);
		const topLeftClose = { collisionData, isTopLeftClose: true, x: 0, y: 0, z: 0 };
		const bottomRightFar = { collisionData, isTopLeftClose: false, x: 0, y: 0, z: 0 };
		collisionData.topLeftClose = topLeftClose;
		collisionData.bottomRightFar = bottomRightFar;
		this.collisionDataList.set(sprite, collisionData);

		sprite.addActivationListener(collisionData.onSpriteActivation);
	}

	removeCollision(sprite) {
		const collisionData = this.collisionDataList.get(sprite);
		if (collisionData) {
			sprite.removeActivationListener(collisionData.onSpriteActivation);
			this.collisionDataList.delete(sprite);
		}
	}

	countCollision(collisionData, secondCollisionData, bits, countedColliders) {
		if (!collisionData.shouldCountCollision) {
			return;
		}
		countedColliders.add(collisionData);
		const collisionBits = collisionData.collisions.get(secondCollisionData) ?? 0;
		collisionData.collisions.set(secondCollisionData, collisionBits | bits); 
	}

	calculateCollisionMarkers(markers) {
		this.updateMarkers(this.collisionDataList, markers);
	}

	refreshCollisionBoxes(time) {
		for (const collisionData of this.collisionDataList.values()) {
			collisionData.collisionBox.getCollisionBox(time);
		}
	}

	updateMarkers(collisionDataList, markers) {
		markers.length = 0;
		for (const collisionData of collisionDataList.values()) {
			const topLeftClose = collisionData.topLeftClose;
			topLeftClose.x = collisionData.collisionBox.left;
			topLeftClose.y = collisionData.collisionBox.top;
			topLeftClose.z = collisionData.collisionBox.close;
			markers.push(topLeftClose);

			const bottomRightFar = collisionData.bottomRightFar;
			bottomRightFar.x = collisionData.collisionBox.right;
			bottomRightFar.y = collisionData.collisionBox.bottom;
			bottomRightFar.z = collisionData.collisionBox.far;
			markers.push(bottomRightFar);
		}
	}

	refresh(time, dt) {
		this.refreshCollisionBoxes(time);
		const { openColliders, countedColliders, markers } = this.temp;

		this.calculateCollisionMarkers(markers);
		for (let m = 0; m < this.sortCallbacks.length; m++) {
			const bits = 1 << m;
			if (this.BOTH & bits) {
				markers.sort(this.sortCallbacks[m]);
				this.countCollisionFromMarkers(markers, bits, openColliders, countedColliders);
			}
		}

		this.applyCollisionsOnAllSprites(time, countedColliders);
	}

	countCollisionFromMarkers(markers, bits, openColliders, countedColliders) {
		for (const marker of markers) {
			if (marker.isTopLeftClose) {
				this.countNewCollisionsWithOpenColliders(marker.collisionData, bits, openColliders, countedColliders);
				openColliders.add(marker.collisionData);
			} else {
				openColliders.delete(marker.collisionData);
			}
		}
	}

	countNewCollisionsWithOpenColliders(collisionData, bits, openColliders, countedColliders) {
		for (const openCollider of openColliders) {
			if (openCollider !== collisionData) {
				this.countCollision(openCollider, collisionData, bits, countedColliders);
			}
		}
		if (collisionData.shouldCountCollision) {
			for (const openCollider of openColliders) {
				if (openCollider !== collisionData) {
					this.countCollision(collisionData, openCollider, bits, countedColliders);
				}
			}
		}
	}

	accountForCollision(collisionData, secondCollisionData, time) {
		const leftPush = collisionData.collisionBox.right - secondCollisionData.collisionBox.left;
		const rightPush = secondCollisionData.collisionBox.right - collisionData.collisionBox.left;
		const xPush = leftPush < rightPush ? -leftPush : rightPush;
		const topPush = collisionData.collisionBox.bottom - secondCollisionData.collisionBox.top;
		const bottomPush = secondCollisionData.collisionBox.bottom - collisionData.collisionBox.top;
		const yPush = topPush < bottomPush ? -topPush : bottomPush;
		const closePush = collisionData.collisionBox.far - secondCollisionData.collisionBox.close;
		const farPush = secondCollisionData.collisionBox.far - collisionData.collisionBox.close;
		const zPush = closePush < farPush ? -closePush : farPush;
		if (collisionData.onCollide) {
			collisionData.onCollide(collisionData.sprite, secondCollisionData.sprite, xPush, yPush, zPush);
		}
		if (collisionData.onEnter && !collisionData.overlapping.has(secondCollisionData)) {
			collisionData.onEnter(collisionData.sprite, secondCollisionData.sprite);
		}
		collisionData.overlapping.set(secondCollisionData, time);
	}

	applyCollisionsOnAllSprites(time, countedColliders) {
		for (const collisionData of countedColliders) {
			this.applyCollisions(collisionData, time);
		}
		for (const collisionData of countedColliders) {
			this.leaveCollisions(collisionData, time);
		}
		countedColliders.clear();
	}

	applyCollisions(collisionData, time) {
		const collisions = collisionData.collisions;
		for (const secondCollisionData of collisions.keys()) {
			if (collisions.get(secondCollisionData) === this.BOTH) {
				this.accountForCollision(collisionData, secondCollisionData, time);
			}
		}
		collisions.clear();
	}

	leaveCollisions(collisionData, time) {
		const overlapping = collisionData.overlapping;
		for (const overlapperData of overlapping.keys()) {
			if (overlapping.get(overlapperData) !== time) {
				overlapping.delete(overlapperData);
				if (collisionData.onLeave) {
					collisionData.onLeave(collisionData.sprite, overlapperData.sprite);
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