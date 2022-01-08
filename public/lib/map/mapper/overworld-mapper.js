class OverworldMapper extends SpriteMapper {
	constructor(game) {
		super(game);
		this.control = game.control;
	}

	async init(engine) {
		this.map = {
			...this.map,
			'8': new GeneratorWithCallback((col, row, option) => {
				return this.spriteFactory.create({
					name: "hero",
					anim: this.atlas.hero.still,
					size: [50, 75, 2],
					x: 40 * col, y: 400 - 10, z: 40 * row,
					rotation: [-90, 0, 0],					
				});
			}),
			'[': new GeneratorWithCallback((col, row, option) => {
				return this.spriteFactory.create({
					name: `block_${col}_${row}`,
					anim: this.atlas.debugBlock,
					size: [40, 40],
					x: 40 * col, y: 400 - 10, z: 40 * row,
					rotation: [-90, 0, 0],					
				});
			}),
		};
	}
}