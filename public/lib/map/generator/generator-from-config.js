class GeneratorFromConfig extends Generator {
	constructor(config, name) {
		super();
		this.name = name || config.name;
		this.config = config;
	}

	generate(spriteMapper, col, row, option) {
		const config = {
			... this.config,
			name: `${this.name}_${col}_${row}`,
		};
		const properties = {
			... this.config.properties,
		}

		return spriteMapper.spriteFactory.create(config, properties);
	}
}