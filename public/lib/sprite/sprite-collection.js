/*
 	Class for combining Sprite.
*/

class SpriteCollection {
	constructor(engine, refresher) {
		this.sprites = [];
		this.engine = engine;
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
		if (!root) {
			console.warn("Anim doesn't exist: ", anim);
		}
		return root;
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
	}

	cleanupInactive() {
		let activeCount = 0;
		for (let i = 0; i < this.sprites.length; i++) {
			if (!this.sprites[i].destroyed) {
				this.sprites[activeCount] = this.sprites[i];
				this.sprites[activeCount].spriteIndex = activeCount;
				activeCount++;
			}
		}
		if (this.sprites.length !== activeCount) {
			console.log("Sprite reduction:", this.sprites.length, "=>", activeCount);
		}
		this.sprites.length = activeCount;
	}

	filterBy(name) {
		const filteredSprites = [];
		for (let i = 0; i < this.sprites.length; i++) {
			if (this.sprites[i][name]) {
				filteredSprites.push(this.sprites[i]);
			}
		}
		return filteredSprites;
	}
}