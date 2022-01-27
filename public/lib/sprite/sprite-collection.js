/*
 	Class for combining Sprite.
*/

class SpriteCollection {
	constructor(engine, refresher) {
		this.sprites = [];
		this.engine = engine;
		this.refresher  = refresher;
	}

	create(id, data, attributes, spriteData, game) {
		const type = data.type ? nameToClass(data.type) : Sprite;
		const sprite = new type({
			id,
			...data,
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
		for (let sprite of this.sprites) {
			sprite.postCreate();
		}
	}

	get(index) {
		return this.sprites[index];
	}

	size() {
		return this.sprites.length;
	}

	clear() {
		this.filterOut(() => true);
	}

	spritesFilteredBy(name) {
		const filteredSprites = [];
		for (let sprite of this.sprites) {
			if (sprite[name]) {
				filteredSprites.push(sprite);				
			}
		}
		return filteredSprites;
	}

	filterOut(condition) {
		let activeCount = 0;
		for (let i = 0; i < this.sprites.length; i++) {
			if (!condition(this.sprites[i])) {
				this.sprites[activeCount] = this.sprites[i];
				this.sprites[activeCount].spriteIndex = activeCount;
				activeCount++;
			} else {
				this.sprites[i].changeActive(false);				
			}
		}
		if (activeCount && this.sprites.length !== activeCount) {
			console.log("Sprite reduction:", this.sprites.length, "=>", activeCount);
		}
		this.sprites.length = activeCount;
	}
}