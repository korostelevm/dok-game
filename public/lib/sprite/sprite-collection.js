/*
 	Class for combining Sprite.
*/

class SpriteCollection {
	constructor() {
		this.sprites = [];
	}

	create(data) {
		const sprite = new Sprite(data);
		this.sprites.push(sprite);
		return sprite;
	}

	get(index) {
		return this.sprites[index];
	}

	size() {
		return this.sprites.length;
	}
}