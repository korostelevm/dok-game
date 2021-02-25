/*
 	Class for combining Sprite.
*/

class SpriteCollection {
	constructor() {
		this.sprites = [];
	}

	create(data, attributes) {
		const sprite = new Sprite(data);
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
}