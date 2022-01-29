const TEXTURE_EDGE_CALCULATOR_DATA_PATH = "texture/texture-edge-data.json";

class TextureEdgeCalculator {
	constructor(directData) {
		this.directData = directData;
		this.textureEdgeData = {};
	}

	async init() {
		try {
			this.textureEdgeData = await this.directData.getData(TEXTURE_EDGE_CALCULATOR_DATA_PATH) || {};
		} catch (e) {
			console.error("Failed to load texure edge data", e);
		}
		const allMd5 = new Set();
		Object.values(assetMd5).forEach(md5 => allMd5.add(md5));
		for (let md5 in this.textureEdgeData) {
			if (!allMd5.has(md5)) {
				delete this.textureEdgeData[md5];
				this.directData.didChange(TEXTURE_EDGE_CALCULATOR_DATA_PATH);
			}
		}
	}

	async calculateCollisionBoxes(collision_url, textureAtlas, imageLoader) {
		const cols = textureAtlas.cols;
		const rows = textureAtlas.rows;
		const tag = assetMd5[collision_url.split("/").pop()];
		if (this.textureEdgeData[tag]) {
			return this.textureEdgeData[tag];
		}
		console.log("Calculating collision box on: " + collision_url + "(" + tag + ")");
		const canvas = textureAtlas.canvas;
		const collisionBoxes = [];
		const collisionImage = await imageLoader.loadImage(collision_url);
		canvas.width = collisionImage.naturalWidth;
		canvas.height = collisionImage.naturalHeight;
		const context = canvas.getContext("2d");
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.drawImage(collisionImage, 0, 0);

		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				const cellWidth = canvas.width / cols;
				const cellHeight = canvas.height / rows;
				const cellX = col * cellWidth;
				const cellY = row * cellHeight;
				const top = TextureAtlas.getTop(context, cellX, cellY, cellWidth, cellHeight);
				if (top < 0) {
					continue;
				}
				const bottom = TextureAtlas.getBottom(context, cellX, cellY, cellWidth, cellHeight) + 1;
				const left = TextureAtlas.getLeft(context, cellX, cellY, cellWidth, cellHeight);
				const right = TextureAtlas.getRight(context, cellX, cellY, cellWidth, cellHeight) + 1;
				if (top >= 0 && bottom >= 0 && left >= 0 && right >= 0) {
					collisionBoxes[row * cols + col] = {
						collision_url,
						updated: new Date(),
						top: top / cellHeight,
						left: left / cellWidth,
						bottom: bottom / cellHeight,
						right: right / cellWidth,
						close: 0, far: 1,
					};
				}
			}
		}

		this.textureEdgeData[tag] = collisionBoxes;
		this.directData.didChange(TEXTURE_EDGE_CALCULATOR_DATA_PATH);
		return collisionBoxes;
	}	
}