class ConfigMapper extends SpriteMapper {
	constructor(game, mapping) {
		super(game);
		this.mapping = mapping || {};
	}

	async init(engine) {
		for (let m in this.mapping) {
			this.map[m] = new GeneratorFromConfig(this.mapping[m]);
		}
	}	
}