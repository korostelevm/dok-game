class OverworldMapper extends SpriteMapper {
	constructor(game) {
		super(game);
		this.control = game.control;
	}

	async init(engine) {
		const onMotion = (self, dx, dy) => {
			const still = dx === 0;
			const time = self.engine.lastTime;
			const climbing = time - self.climbing < 100;
			const climbingStill = climbing && self.dx === 0 && self.dy === 0;
			const jumping = time - self.lastJump < 300;
			const crouchingStill = self.crouch && dx === 0;
			self.changeAnimation(climbingStill ? this.atlas.hero.climb_still
				: climbing ? this.atlas.hero.climb
				: jumping ? this.atlas.hero.jump
				: crouchingStill ? this.atlas.hero.crouch_still
				: self.crouch ? this.atlas.hero.crouch
				: still ? this.atlas.hero.still
				: this.atlas.hero.run);
			if (dx !== 0) {
				self.changeDirection(dx < 0 ? -1 : 1);
			}
		};

		this.map = {
			...this.map,
			'8': new GeneratorWithCallback((col, row, option) => {
				return this.spriteFactory.create({
					name: "hero",
					anim: this.atlas.hero.still,
					size: [50, 75, 2],
					hotspot: [25, 75],
					x: 40 * col, y: 400 - 10, z: -200 * row,
					rotation: [-90, 0, 0],					
//					remember: true,
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
			'V': new GeneratorWithCallback((col, row, option) => {
				return this.spriteFactory.create({
					name: `crate_${col}_${row}`,
					anim: this.atlas.debugCrate,
					size: [40, 40],
					x: 40 * col, y: 40 * row,
				});
			}),
			'H': new GeneratorWithCallback((col, row, option) => {
				return this.spriteFactory.create({
					name: `ladder_${col}_${row}`,
					anim: this.atlas.debugLadder,
					size: [40, 40],
					x: 40 * col, y: 40 * row,
				});
			}),
			'^': new GeneratorWithCallback((col, row, option) => {
				return this.spriteFactory.create({
					name: `lowceiling_${col}_${row}`,
					anim: this.atlas.debugCeiling,
					size: [40, 40],
					x: 40 * col, y: 40 * row,
				});				
			}),
			'?': new GeneratorWithCallback((col, row, option) => {
				return this.spriteFactory.create({
					name: `npc_${col}_${row}`,
					anim: this.atlas.npc.still,
					size: [40, 40],
					x: 40 * col, y: 40 * row,
				});
			}),
			'$': new GeneratorWithCallback((col, row, option) => {
				return this.spriteFactory.create({
					name: `coin_${col}_${row}`,
					anim: this.atlas.debugCoin,
					size: [40, 40],
					x: 40 * col, y: 40 * row,
				});
			}),
			'@': new GeneratorWithCallback((col, row, option) => {
				return this.spriteFactory.create({
					name: `bounce_${col}_${row}`,
					anim: this.atlas.debugBounce,
					size: [40, 40],
					x: 40 * col, y: 40 * row,
				});
			}),
			'D': new GeneratorWithCallback((col, row, option) => {
				const door = this.spriteFactory.create({
					name: "the door",
					id: `door_${col}_${row}`,
					anim: this.atlas.debugDoorBack,
					size: [40, 60],
					x: 40 * col, y: 40 * row - 20,
				});
				door.door = this.spriteFactory.create({
					id: `door_door_${col}_${row}`,
					anim: this.atlas.debugDoorStill,
					size: [40, 60],
					x: 40 * col, y: 40 * row - 20,
				});
				return door;
			}),
		};
	}
}