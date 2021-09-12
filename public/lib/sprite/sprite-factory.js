class SpriteFactory {
	constructor(sceneData, spriteCollection, game) {
		this.spriteCollection = spriteCollection;
		this.spriteData = sceneData.sprite || (sceneData.sprite = {});
		this.index = 0;
	}

	create(data, attributes, initCallback) {
		const id = (typeof(data.name) !== "function" ? data.name : null) || engine.game.constructor.name + this.index;
		const properties = this.spriteData[id] || (this.spriteData[id] = {});
		this.index++;
		const sprite = this.spriteCollection.create(data, attributes, properties);
		if (initCallback) {
			initCallback(sprite);
		}
		return sprite;
	}

	postCreate() {
		this.spriteCollection.postCreate();
	}
}