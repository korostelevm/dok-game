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

	create(data, attributes, spriteData) {
		const type = data.type ? eval(data.type) : Sprite;
		const sprite = new type({
			...data,
			anim: typeof(data.anim) === "string" ? this.engine.game.atlas[data.anim] : data.anim,
		}, this.engine.lastTime, spriteData);
		sprite.index = this.sprites.index;
		this.sprites.push(sprite);
		
		for (let i in attributes) {
			sprite[i] = attributes[i];
			if (typeof(attributes[i]) === "undefined") {
				console.error("Key " + i + " is not valid on " + sprite.name);
			}
		}
		if (sprite.onRefresh && !sprite.manualRefresh) {
			this.refresher.addRefresh(sprite);
		}		
		return sprite;
	}

	postCreate() {
		this.sprites.forEach(sprite => {
			for (let key in sprite.properties) {
				sprite.onUpdate(key, sprite.properties[key], true);
			}
		});
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