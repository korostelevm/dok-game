const HORIZONTAL = 0, VERTICAL = 1, DEEP = 2;

class Collision extends PhysicsBase {
	constructor({horizontal, vertical, deep}) {
		super();
		this.H = 1 << HORIZONTAL;
		this.V = 1 << VERTICAL;
		this.D = 1 << DEEP;

		this.BOTH = (horizontal ? this.H : 0) | (vertical ? this.V : 0) | (deep ? this.D : 0);
		this.countType = [horizontal, vertical, deep];
	}

	async init(sprites, game) {
		this.game = game;
		const filteredSprites = sprites.filter(({collide}) => collide);
		this.axis = [
			this.horizontal = [],
			this.vertical = [],
			this.deep = [],
		];
		this.markers = new Set();
		this.openColliders = new Set();
		this.countedColliders = new Set();

		this.collisionDataList = [];
		for (let colIndex = 0; colIndex < filteredSprites.length; colIndex++) {
			const sprite = filteredSprites[colIndex];
			const collisionData = {
				sprite,
				id: sprite.id,
				collisionBox: sprite.collisionBox,
				colIndex,
				colliders: [],
				collisions: new Array(filteredSprites.length).fill(null).map(() => 0),
				overlappers: new Set(),
				overlapping: new Array(filteredSprites.length).fill(null).map(() => 0),
				countCollision: !!(sprite.onCollide || sprite.onLeave || sprite.onEnter),
				onCollide: sprite.onCollide,
				onLeave: sprite.onLeave,
				onEnter: sprite.onEnter,
			};
			const topLeftClose = { collisionData, topLeftClose: true, bottomRightFar: false, x: 0, y: 0, z: 0 };
			const bottomRightFar = { collisionData, topLeftClose: false, bottomRightFar: true, x: 0, y: 0, z: 0 };
			if (this.countType[HORIZONTAL]) {
				this.horizontal.push(topLeftClose, bottomRightFar);
			}
			if (this.countType[VERTICAL]) {
				this.vertical.push(topLeftClose, bottomRightFar);
			}
			if (this.countType[DEEP]) {
				this.deep.push(topLeftClose, bottomRightFar);
			}
			this.markers.add(topLeftClose);
			this.markers.add(bottomRightFar);
			this.collisionDataList[colIndex] = collisionData;
		}
	}

	countCollision(collisionData, secondCollisionData, bits) {
		if (!collisionData.countCollision) {
			return;
		}
		const colIndex = secondCollisionData.colIndex;
		const collisions = collisionData.collisions;
		const colliders = collisionData.colliders;
		if (!collisions[colIndex]) {
			if (!colliders.length) {
				this.countedColliders.add(collisionData);
			}
			colliders.push(colIndex);
		}
		collisions[colIndex] |= bits; 
	}

	calculateCollisionMarkers(time) {
		this.refreshCollisionBoxes(time);
		this.updateMarkers();
		this.sortMarkers();
	}

	refreshCollisionBoxes(time) {
		for (let collisionData of this.collisionDataList) {
			collisionData.collisionBox.getCollisionBox(time);
		}
	}

	updateMarkers() {
		for (let marker of this.markers) {
			marker.x = marker.topLeftClose ? marker.collisionData.collisionBox.left : marker.collisionData.collisionBox.right;			
			marker.y = marker.topLeftClose ? marker.collisionData.collisionBox.top : marker.collisionData.collisionBox.bottom;
			marker.z = marker.topLeftClose ? marker.collisionData.collisionBox.close : marker.collisionData.collisionBox.far;
		}
	}

	sortMarkers() {
		this.horizontal.sort(this.compareHorizontal);
		this.vertical.sort(this.compareVertical);
		this.deep.sort(this.compareDepth);
	}

	refresh(time, dt) {
		this.calculateCollisionMarkers(time);

		for (let m = 0; m < this.axis.length; m++) {
			this.countCollisionFromMarkers(this.axis[m], m);
		}
		this.applyCollisionsOnAllSprites(time);
	}

	countCollisionFromMarkers(markers, type) {
		const bits = 1 << type;
		for (let marker of markers) {
			const collisionData = marker.collisionData;
			if (!collisionData.sprite.active) {
				continue;
			}

			this.countNewCollisionsWithOpenColliders(collisionData, bits);

			if (marker.topLeftClose) {
				//	Open the new colliders
				this.addOpenCollider(collisionData);
			} else {
				//	Close colliders
				this.removeOpenCollider(collisionData);
			}
		}
	}

	addOpenCollider(collisionData) {
		this.openColliders.add(collisionData);
	}

	removeOpenCollider(collisionData) {
		this.openColliders.delete(collisionData);
	}

	countNewCollisionsWithOpenColliders(collisionData, bits) {
		for (let openCollider of this.openColliders) {
			if (openCollider.id !== collisionData.id) {
				this.countCollision(openCollider, collisionData, bits);
			}
		}
		if (collisionData.countCollision) {
			for (let openCollider of this.openColliders) {
				if (openCollider.id !== collisionData.id) {
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
		if (!collisionData.overlapping[secondCollisionData.colIndex]) {
			if (collisionData.onEnter) {
				collisionData.onEnter(collisionData.sprite, secondCollisionData.sprite);
			}
			collisionData.overlappers.add(secondCollisionData.colIndex);
		}
		collisionData.overlapping[secondCollisionData.colIndex] = time;
	}

	applyCollisionsOnAllSprites(time) {
		for (let collisionData of this.countedColliders) {
			this.applyCollisions(collisionData, time);
		}
		for (let collisionData of this.countedColliders) {
			this.leaveCollisions(collisionData, time);
		}
		this.countedColliders.clear();
	}

	applyCollisions(collisionData, time) {
		for (let index of collisionData.colliders) {
			const secondCollisionData = this.collisionDataList[index];
			if (collisionData.collisions[secondCollisionData.colIndex] === this.BOTH) {
				this.accountForCollision(collisionData, secondCollisionData, time);
			}
			collisionData.collisions[secondCollisionData.colIndex] = 0;
		}
		collisionData.colliders.length = 0;
	}

	leaveCollisions(collisionData, time) {
		const overlapping = collisionData.overlapping;
		for (let overlapperIndex of collisionData.overlappers) {
			if (overlapping[overlapperIndex] !== time) {
				overlapping[overlapperIndex] = 0;
				collisionData.overlappers.delete(overlapperIndex);
				if (collisionData.onLeave) {
					collisionData.onLeave(collisionData.sprite, this.collisionDataList[overlapperIndex].sprite);
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