class Shadow extends Sprite {
	constructor(data, time, properties, engine, game) {
		super({
			anim: data.sprite.anim,
			size: data.sprite.size,
			x: data.sprite.x, y: data.sprite.y + 5, z: data.sprite.z,
			light: 0,
			opacity: .5,
			rotation: [-90, 0, 0],					
		}, time, properties, engine, game);
		this.follow(data.sprite);
		data.sprite.shadow = this;
	}
}