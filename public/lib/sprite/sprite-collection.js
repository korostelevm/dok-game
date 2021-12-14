/*
 	Class for combining Sprite.
*/

class SpriteCollection {
	constructor(engine) {
		this.sprites = [];
		this.engine = engine;
		this.filtered = {};
		this.refreshers = [];
	}

	create(data, attributes, spriteData) {
		const type = data.type ? eval(data.type) : Sprite;
		const sprite = new type({
			...data,
			anim: typeof(data.anim) === "string" ? this.engine.game.atlas[data.anim] : data.anim,
		}, this.engine.lastTime, spriteData);
		sprite.index = this.sprites.index;
		sprite.refreshIndex = null;
		this.sprites.push(sprite);
		
		for (let i in attributes) {
			sprite[i] = attributes[i];
			if (typeof(attributes[i]) === "undefined") {
				console.error("Key " + i + " is not valid on " + sprite.name);
			}
		}
		if (sprite.onRefresh && !sprite.manualRefresh) {
			this.addRefresh(sprite);
		}		
		return sprite;
	}

	addRefresh(sprite) {
		if (sprite.refreshIndex === null) {
			sprite.refreshIndex = this.refreshers.length;
			this.refreshers.push(sprite);
		}
	}

	removeRefresh(sprite) {
		const refreshIndex = sprite.refreshIndex;
		if (refreshIndex !== null) {
			this.refreshers[refreshIndex] = this.refreshers[this.refreshers.length - 1];
			this.refreshers[refreshIndex].refreshIndex = refreshIndex;
			this.refreshers.pop();
			sprite.refreshIndex = null;
		}
	}

	getRefreshers() {
		return this.refreshers;
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