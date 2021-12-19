class Utils {
	static makeVertexArray(row0, row1, row2, row3) {
		return [
			...row0,
			...row1,
			...row2,
			...row2,
			...row1,
			...row3,
		];
	}

	static colorToBytes(color) {
		const R = (color & 0xFF0000) >> 16;
		const G = (color & 0xFF00) >> 8;
		const B = (color & 0xFF);
		const A = ((color & 0xFF000000) >> 24) ^ 0xFF;
		return [R, G, B, A];
	}

	static makeSpriteCoordinatesAtCenter(config, x, y, width, height, outputFloat32Array) {
		const {viewport: {pixelScale, size: [viewportWidth, viewportHeight]}} = config;
		const x0 = (x - width / 2) / viewportWidth / pixelScale;
		const x1 = (x + width / 2) / viewportWidth / pixelScale;
		const y0 = (y - height / 2) / viewportHeight / pixelScale;
		const y1 = (y + height / 2) / viewportHeight / pixelScale;

		const result = outputFloat32Array || new Array(12);
		let i = 0;
		result[i++] = x0; result[i++] = y0;	//	row0
		result[i++] = x1; result[i++] = y0;	//	row1
		result[i++] = x0; result[i++] = y1;	//	row2
		result[i++] = x0; result[i++] = y1;	//	row2
		result[i++] = x1; result[i++] = y0;	//	row1
		result[i++] = x1; result[i++] = y1;	//	row3
		return result;
	}
}

Utils.FULL_VERTICES = new Float32Array(Utils.makeVertexArray(
    [ -1, -1 ],
    [  1, -1 ],
    [ -1,  1 ],
    [  1,  1 ],
));
