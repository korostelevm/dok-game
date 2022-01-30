class Constants {
	//	dummy.
	static defaultViewportSize() {
		return [800, 400];
	}

	static defaultWindowSize(viewportWidth, viewportHeight) {
		return [viewportWidth + 100, viewportHeight + 100]
	}
}

Constants.HOTSPOT_CENTER = [.5, .5];
Constants.HOTSPOT_BOTTOM = [.5, 1];
Constants.HORIZONTAL_MERGE = 1;
Constants.VERTICAL_MERGE = 2;
Constants.FULL_MERGE = Constants.HORIZONTAL_MERGE | Constants.VERTICAL_MERGE;
Constants.EMPTY = {};
Constants.EMPTY_POSITION = [0, 0, 0];
Constants.EMPTY_HOTSPOT = [0, 0];

Constants.SPRITE_TYPES = {
	none: 0,
	hud: 1,
	sprite: 2,
};

Constants.UPDATE_FLAG = {
	ACTIVE: 		1 << 0,
	MOTION: 		1 << 1,
	SPRITE: 		1 << 2,
	SPRITE_SHEET: 	1 << 3,
	SPRITE_TYPE: 	1 << 4,
	ANIMATION: 		1 << 5,
	UPDATE_TIME: 	1 << 6,
	DIRECTION: 		1 << 7,
	OPACITY: 		1 << 8,
	ACCELERATION: 	1 << 9,
	LIGHT: 			1 << 10,
};

Constants.RENDER_FLAG = {
	SPRITE_ATTRIBUTE: Constants.UPDATE_FLAG.SPRITE|Constants.UPDATE_FLAG.ANIMATION,
	TEXTURE: Constants.UPDATE_FLAG.ANIMATION|Constants.UPDATE_FLAG.OPACITY
		|Constants.UPDATE_FLAG.ACTIVE|Constants.UPDATE_FLAG.LIGHT
		|Constants.UPDATE_FLAG.SPRITE_TYPE,
	ANIMATION_INFO: Constants.UPDATE_FLAG.ANIMATION|Constants.UPDATE_FLAG.DIRECTION,
	MOTION: Constants.UPDATE_FLAG.MOTION,
	UPDATE_TIME: Constants.UPDATE_FLAG.UPDATE_TIME|Constants.UPDATE_FLAG.MOTION,
};

Constants.DEG_TO_RAD = Math.PI / 180;
