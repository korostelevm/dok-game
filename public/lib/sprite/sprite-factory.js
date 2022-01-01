class SpriteFactory {
	constructor(sceneData, spriteCollection, game) {
		this.spriteCollection = spriteCollection;
		this.spriteData = sceneData.sprite || (sceneData.sprite = {});
		this.game = game;
		this.index = 0;
	}

	create(data, attributes, initCallback) {
		const id = data.id || (typeof(data.name) !== "function" ? data.name : data.name()) || this.game.constructor.name + this.index;
		const properties = this.spriteData[id] || (this.spriteData[id] = {});
		this.index++;
		const sprite = this.spriteCollection.create(id, data, attributes, properties, this.game);
		if (initCallback) {
			initCallback(sprite);
		}
		return sprite;
	}

	postCreate() {
		this.spriteCollection.postCreate();
	}
}