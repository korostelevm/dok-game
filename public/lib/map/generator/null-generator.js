class NullGenerator extends Generator {
	generate(spriteMapper, col, row, option) {
		return null;
	}
}
NullGenerator.instance = new NullGenerator();