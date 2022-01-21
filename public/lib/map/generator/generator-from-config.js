class GeneratorFromConfig extends Generator {
	constructor(config, name) {
		super();
		this.name = name || config.name;
		this.config = config;
	}

	generate(spriteMapper, col, row, option) {
		return spriteMapper.spriteFactory.create({
			... this.config,
			name: `${this.name}_${col}_${row}`,
			x: (this.config.spriteWidth||40) * col,
			y: (this.config.spriteHeight||40) * row,
		}, {
			... this.config.properties,
		});
	}
}