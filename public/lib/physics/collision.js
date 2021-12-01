class Collision extends PhysicsBase {
	async init(sprites, game) {
		this.game = game;
		this.sprites = sprites.filter(({collide}) => collide);
		this.horizontal = [];
		this.vertical = [];

		this.sprites.forEach(sprite => {
			const topLeft = { sprite, topLeft: true };
			const bottomRight = { sprite, bottomRight: true };
			this.horizontal.push(topLeft, bottomRight);
			this.vertical.push(topLeft, bottomRight);
		});
	}

	refresh(time, dt) {
		this.sprites.forEach(sprite => sprite.getCollisionBox(time));

		this.horizontal.sort(this.compareHorizontal);
		this.vertical.sort(this.compareVertical);

		const collisionCount = {};

		const hits = [
			{}, {},
		];
		const axis = [
			this.horizontal,
			this.vertical,
		];

		for (let m = 0; m < axis.length; m++) {
			let hitCount = 0;
			const hit = hits[m];
			const ax = axis[m];
			for (let i = 0; i < ax.length; i++) {
				const { sprite, topLeft, bottomRight } = ax[i];
				if (topLeft) {
					hit[sprite.id] = sprite;
					this.recordHit(sprite, hit, collisionCount, time);
				} else {
					delete hit[sprite.id];
				}
			}
		}
		for (let touch in collisionCount) {
			if (collisionCount[touch] >= 2) {
				const [first,second] = touch.split("/");
				const firstSprite = this.game[first];
				if (firstSprite.onCollide) {
					const secondSprite = this.game[second];
					const leftPush = firstSprite.collisionBox.right - secondSprite.collisionBox.left;
					const rightPush = secondSprite.collisionBox.right - firstSprite.collisionBox.left;
					const xPush = leftPush < rightPush ? -leftPush : rightPush;
					const topPush = firstSprite.collisionBox.bottom - secondSprite.collisionBox.top;
					const bottomPush = secondSprite.collisionBox.bottom - firstSprite.collisionBox.top;
					const yPush = topPush < bottomPush ? -topPush : bottomPush;
					firstSprite.onCollide(firstSprite, secondSprite, xPush, yPush);
				}
			}
		}
	}

	recordHit(sprite, hit, collisionCount, time) {
		for (let i in hit) {
			if (sprite.id === i) {
				continue;
			}
			if (hit[i].onCollide) {
				collisionCount[`${i}/${sprite.id}`] = (collisionCount[`${i}/${sprite.id}`] || 0) + 1;
			}
			if (sprite.onCollide) {
				collisionCount[`${sprite.id}/${i}`] = (collisionCount[`${sprite.id}/${i}`] || 0) + 1;
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