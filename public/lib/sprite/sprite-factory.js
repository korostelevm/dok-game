class SpriteFactory {
	constructor(sceneData, spriteCollection, game) {
		this.spriteCollection = spriteCollection;
		this.spriteData = sceneData.sprite || (sceneData.sprite = {});
		this.index = 0;
	}

	create(data, attributes) {
		const id = data.name || this.index;
		const properties = this.spriteData[id] || (this.spriteData[id] = {});
		this.index++;
		return this.spriteCollection.create(data, attributes, properties);
	}

}