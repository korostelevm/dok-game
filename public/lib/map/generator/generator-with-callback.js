class GeneratorWithCallback extends Generator {
	constructor(callback) {
		super();
		this.callback = callback;
	}

	generate(spriteMapper, col, row, option) {
		return this.callback.call(spriteMapper, col, row, option);
	}
}