class Collision extends PhysicsBase {
	async init(sprites, game) {
		this.game = game;
		const filteredSprites = sprites.filter(({collide}) => collide);
		this.sprites = filteredSprites;
		this.horizontal = [];
		this.vertical = [];
		this.axis = [
			this.horizontal,
			this.vertical,
		];
		this.openColliders = {};

		const H = 1, V = 2;
		const BOTH = H | V;

		const countCollision = function(index, horizontal) {
			if (!this.collisions[index]) {
				this.colliders.push(index);
			}
			this.collisions[index] |= horizontal ? H : V; 
		};
		const collisionComponent = this;
		const applyCollisions = function() {
			const firstSprite = this;
			for (let i = 0; i < this.colliders.length; i++) {
				const index = this.colliders[i];
				const secondSprite = filteredSprites[index];
				if (this.collisions[secondSprite.colIndex] === BOTH) {
					collisionComponent.accountForCollision(firstSprite, secondSprite);
				}
				firstSprite.collisions[secondSprite.colIndex] = 0;
			}
			this.colliders.length = 0;
		};

		this.sprites.forEach((sprite, index) => {
			const topLeft = { sprite, topLeft: true };
			const bottomRight = { sprite, bottomRight: true };
			this.horizontal.push(topLeft, bottomRight);
			this.vertical.push(topLeft, bottomRight);
			sprite.colIndex = index;
			sprite.colliders = [];
			sprite.collisions = new Array(this.sprites.length).fill(null).map(() => 0);

			sprite.countCollision = countCollision;
			sprite.applyCollisions = applyCollisions;
		});
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

				//	Count new collisions with the open colliders
				for (let id in openColliders) {
					const openCollider = openColliders[id];
					if (id !== sprite.id) {
						if (openCollider.onCollide) {
							openCollider.countCollision(sprite.colIndex, m === 0);
						}
						if (sprite.onCollide) {
							sprite.countCollision(openCollider.colIndex, m === 0);
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
		this.applyCollisions();
	}

	accountForCollision(firstSprite, secondSprite) {
		const leftPush = firstSprite.collisionBox.right - secondSprite.collisionBox.left;
		const rightPush = secondSprite.collisionBox.right - firstSprite.collisionBox.left;
		const xPush = leftPush < rightPush ? -leftPush : rightPush;
		const topPush = firstSprite.collisionBox.bottom - secondSprite.collisionBox.top;
		const bottomPush = secondSprite.collisionBox.bottom - firstSprite.collisionBox.top;
		const yPush = topPush < bottomPush ? -topPush : bottomPush;
		firstSprite.onCollide(firstSprite, secondSprite, xPush, yPush);
	}

	applyCollisions() {
		for (let i = 0; i < this.sprites.length; i++) {
			this.sprites[i].applyCollisions();
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