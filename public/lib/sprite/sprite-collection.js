/*
 	Class for combining Sprite.
*/

class SpriteCollection {
	constructor(engine, refresher) {
		this.sprites = [];
		this.engine = engine;
		this.filtered = {};
		this.refresher  = refresher;
	}

	static fetchAnim(atlas, anim) {
		if (typeof(anim) !== "string") {
			return anim;
		}
		const idSplit = anim.split(".");
		let root = atlas;
		for (let i = 0; i < idSplit.length; i++) {
			root = root[idSplit[i]];
		}
		return root;
	}

	create(id, data, attributes, spriteData, game) {
		const type = data.type ? nameToClass(data.type) : Sprite;
		const sprite = new type({
			id,
			...data,
			anim: typeof(data.anim) === "string" ? SpriteCollection.fetchAnim(this.engine.game.atlas, data.anim) : data.anim,
		}, this.engine.lastTime, spriteData, this.engine, game);
		sprite.spriteIndex = this.sprites.length;
		this.sprites.push(sprite);
		
		for (let i in attributes) {
			sprite[i] = attributes[i];
			if (typeof(attributes[i]) === "undefined") {
				console.error("Key " + i + " is not valid on " + sprite.name);
			}
		}
		if (sprite.onRefresh && !sprite.manualRefresh) {
			this.refresher.add(sprite);
		}		
		return sprite;
	}

	postCreate() {
		this.sprites.forEach(sprite => sprite.postCreate());
	}

	get(index) {
		return this.sprites[index];
	}

	size() {
		return this.sprites.length;
	}

	clear() {
		this.sprites.length = 0;
		for (let f in this.filtered) {
			delete this.filtered[f];
		}
	}

	filterBy(name) {
		if (this.filtered[name]) {
			return this.filtered[name];
		}

		const filteredSprites = [];
		for (let i = 0; i < this.sprites.length; i++) {
			if (this.sprites[i][name]) {
				filteredSprites.push(this.sprites[i]);
			}
		}
		return this.filtered[name] = filteredSprites;
	}
}