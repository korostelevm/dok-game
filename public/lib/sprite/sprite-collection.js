/*
 	Class for combining Sprite.
*/

class SpriteCollection {
	constructor(engine) {
		this.sprites = [];
		this.engine = engine;
	}

	create(data, attributes) {
		const sprite = new Sprite(data, this.engine.lastTime);
		this.sprites.push(sprite);
		

		for (let i in attributes) {
			sprite[i] = attributes[i];
		}
		return sprite;
	}

	get(index) {
		return this.sprites[index];
	}

	size() {
		return this.sprites.length;
	}

	clear() {
		this.sprites.length = 0;
	}
}