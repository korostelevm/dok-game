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
		this.openColliders = [];
		this.countedColliders = [];

		this.collisionDataList = [];
		this.preCollisions = [];
		filteredSprites.forEach((sprite, colIndex) => {
			const collisionData = {
				sprite,
				id: sprite.id,
				collisionBox: sprite.collisionBox,
				colIndex,
				colliders: [],
				collisions: new Array(filteredSprites.length).fill(null).map(() => 0),
				overlappers: [],
				overlapping: new Array(filteredSprites.length).fill(null).map(() => 0),
				countCollision: !!(sprite.onCollide || sprite.onLeave || sprite.onEnter),
				openColliderIndex: 0,
				onCollide: sprite.onCollide,
				onLeave: sprite.onLeave,
				onEnter: sprite.onEnter,
				preCollisionCheck: sprite.preCollisionCheck,
				trackCollision: sprite.trackCollision,
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
			this.collisionDataList[colIndex] = collisionData;
			if (collisionData.preCollisionCheck) {
				this.preCollisions.push(collisionData);
			}
		});
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
				this.countedColliders.push(collisionData);
			}
			colliders.push(colIndex);
		}
		collisions[colIndex] |= bits; 
	}

	calculateCollisionMarkers(time) {
		for (let i = 0; i < this.collisionDataList.length; i++) {
			this.collisionDataList[i].collisionBox.getCollisionBox(time);
		}
		for (let i = 0; i < this.horizontal.length; i++) {
			const marker = this.horizontal[i];
			marker.x = marker.topLeftClose ? marker.collisionData.collisionBox.left : marker.collisionData.collisionBox.right;
		}
		for (let i = 0; i < this.vertical.length; i++) {
			const marker = this.vertical[i];
			marker.y = marker.topLeftClose ? marker.collisionData.collisionBox.top : marker.collisionData.collisionBox.bottom;
		}
		for (let i = 0; i < this.deep.length; i++) {
			const marker = this.deep[i];
			marker.z = marker.topLeftClose ? marker.collisionData.collisionBox.close : marker.collisionData.collisionBox.far;
		}

		this.sortMarkers();
	}

	sortMarkers() {
		this.horizontal.sort(this.compareHorizontal);
		this.vertical.sort(this.compareVertical);
		this.deep.sort(this.compareDepth);
	}

	refresh(time, dt) {
		for (let i = 0; i < this.preCollisions.length; i++) {
			const collisionData = this.preCollisions[i];
			collisionData.preCollisionCheck(collisionData.sprite);
		}
		this.calculateCollisionMarkers(time);

		for (let m = 0; m < this.axis.length; m++) {
			this.countCollisionFromMarkers(this.axis[m], m);
		}
		this.applyCollisionsOnAllSprites(time);
	}

	countCollisionFromMarkers(markers, type) {
		const bits = 1 << type;
		for (let i = 0; i < markers.length; i++) {
			const marker = markers[i];
			const collisionData = marker.collisionData;
			if (!collisionData.sprite.active) {
				return;
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
		const openColliders = this.openColliders;
		collisionData.openColliderIndex = openColliders.length;
		openColliders.push(collisionData);
	}

	removeOpenCollider(collisionData) {
		const openColliders = this.openColliders;
		const openColliderIndex = collisionData.openColliderIndex;
		if (openColliderIndex < openColliders.length) {
			openColliders[openColliderIndex] = openColliders[openColliders.length - 1];
		}
		openColliders.pop();
		if (openColliderIndex < openColliders.length) {
			const replacement = openColliders[openColliderIndex];
			replacement.openColliderIndex = openColliderIndex;
		}
	}

	countNewCollisionsWithOpenColliders(collisionData, bits) {
		const openColliders = this.openColliders;
		for (let i = 0; i < openColliders.length; i++) {
			const openCollider = openColliders[i];
			if (openCollider.id !== collisionData.id) {
				this.countCollision(openCollider, collisionData, bits);
			}
		}
		if (collisionData.countCollision) {
			for (let i = 0; i < openColliders.length; i++) {
				const openCollider = openColliders[i];
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
			collisionData.trackCollision(secondCollisionData.sprite, time);
		}
		if (!collisionData.overlapping[secondCollisionData.colIndex]) {
			if (collisionData.onEnter) {
				collisionData.onEnter(collisionData.sprite, secondCollisionData.sprite);
			}
			collisionData.overlappers.push(secondCollisionData.colIndex);
		}
		collisionData.overlapping[secondCollisionData.colIndex] = time;
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

	applyCollisions(collisionData, time) {
		const colliders = collisionData.colliders;
		for (let i = 0; i < colliders.length; i++) {
			const index = colliders[i];
			const secondCollisionData = this.collisionDataList[index];
			if (collisionData.collisions[secondCollisionData.colIndex] === this.BOTH) {
				this.accountForCollision(collisionData, secondCollisionData, time);
			}
			collisionData.collisions[secondCollisionData.colIndex] = 0;
		}
		colliders.length = 0;
	}

	leaveCollisions(collisionData, time) {
		const overlappers = collisionData.overlappers;
		const overlapping = collisionData.overlapping;
		for (let i = overlappers.length - 1; i >= 0; i--) {
			const overlapperIndex = overlappers[i];
			if (overlapping[overlapperIndex] !== time) {
				overlapping[overlapperIndex] = 0;
				overlappers[i] = overlappers[overlappers.length - 1];
				overlappers.pop();
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