class Collision extends PhysicsBase {
	constructor(parameters) {
		super();
		this.collisionMixer = new CollisionMixer(parameters);
	}

	async init(sprites, game) {
		const onSpriteActivation = (sprite, active) => this.onSpriteActivation(sprite, active);
		sprites.filter(({collide}) => collide).forEach(sprite => {
			if (this.addCollision(sprite)) {
				sprite.activationListeners.add(onSpriteActivation);
			}
		});
	}

	refresh(time, dt) {
		this.collisionMixer.refresh(time);
	}

	onSpriteActivation(sprite, active) {
		if (active) {
			this.addCollision(sprite);
		} else {
			this.removeCollision(sprite);
		}
	}

	addCollision(body) {
		return this.collisionMixer.addCollision(body);
	}

	removeCollision(body) {
		return this.collisionMixer.removeCollision(body);
	}
}