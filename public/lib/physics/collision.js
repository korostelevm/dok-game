const HORIZONTAL = 0, VERTICAL = 1, DEEP = 2;

class Collision extends PhysicsBase {
	constructor({horizontal, vertical, deep}) {
		super();
		this.H = 1 << HORIZONTAL;
		this.V = 1 << VERTICAL;
		this.D = 1 << DEEP;

		this.BOTH = (horizontal ? this.H : 0) | (vertical ? this.V : 0) | (deep ? this.D : 0);
		this.openColliders = new Set();
		this.countedColliders = new Set();
		this.collisionDataList = new Map();
		this.markers = [];
		this.sortCallbacks = [
			this.compareHorizontal,
			this.compareVertical,
			this.compareDepth,
		];
	}

	async init(sprites, game) {
		this.game = game;
		const filteredSprites = sprites.filter(({collide}) => collide);

		for (const sprite of filteredSprites) {
			this.addCollisionData(sprite);
		}
	}

	addCollisionData(sprite) {
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
					this.collisionDataList.delete(sprite);
					sprite.removeActivationListener(collisionData.onSpriteActivation);
					sprite.addActivationListener(collisionData.onReactivate);
				}
			},
			onReactivate: (sprite, active) => {
				if (active) {
					sprite.removeActivationListener(collisionData.onReactivate);
					this.addCollisionData(sprite);
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

	countCollision(collisionData, secondCollisionData, bits) {
		if (!collisionData.shouldCountCollision) {
			return;
		}
		this.countedColliders.add(collisionData);
		const collisionBits = collisionData.collisions.get(secondCollisionData) ?? 0;
		collisionData.collisions.set(secondCollisionData, collisionBits | bits); 
	}

	calculateCollisionMarkers() {
		return this.updateMarkers(this.collisionDataList, this.markers);
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
		return markers;
	}

	refresh(time, dt) {
		this.refreshCollisionBoxes(time);		
		const markers = this.calculateCollisionMarkers();

		for (let m = 0; m < this.sortCallbacks.length; m++) {
			const bits = 1 << m;
			if (this.BOTH & bits) {
				markers.sort(this.sortCallbacks[m]);
				this.countCollisionFromMarkers(markers, bits);
			}
		}
		this.applyCollisionsOnAllSprites(time);
	}

	countCollisionFromMarkers(markers, bits) {
		for (const marker of markers) {
			const collisionData = marker.collisionData;
			if (marker.isTopLeftClose) {
				this.countNewCollisionsWithOpenColliders(collisionData, bits);
				this.openColliders.add(collisionData);
			} else {
				this.openColliders.delete(collisionData);
			}
		}
	}

	countNewCollisionsWithOpenColliders(collisionData, bits) {
		for (const openCollider of this.openColliders) {
			if (openCollider !== collisionData) {
				this.countCollision(openCollider, collisionData, bits);
			}
		}
		if (collisionData.shouldCountCollision) {
			for (const openCollider of this.openColliders) {
				if (openCollider !== collisionData) {
					this.countCollision(collisionData, openCollider, bits);
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

	applyCollisionsOnAllSprites(time) {
		for (const collisionData of this.countedColliders) {
			this.applyCollisions(collisionData, time);
		}
		for (const collisionData of this.countedColliders) {
			this.leaveCollisions(collisionData, time);
		}
		this.countedColliders.clear();
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