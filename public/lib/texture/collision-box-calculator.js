const COLLISION_BOX_CALCULATOR_DATA_PATH = "collision/collision-data.json";

class CollisionBoxCalculator {
	constructor(directData) {
		this.directData = directData;
		this.collisionData = {};
	}

	async init() {
		this.collisionData = await this.directData.getData(COLLISION_BOX_CALCULATOR_DATA_PATH) || {};
		const allMd5 = new Set();
		Object.values(assetMd5).forEach(md5 => allMd5.add(md5));
		for (let md5 in this.collisionData) {
			if (!allMd5.has(md5)) {
				delete this.collisionData[md5];
				this.directData.didChange(COLLISION_BOX_CALCULATOR_DATA_PATH);
			}
		}
	}

	async calculateCollisionBoxes(collision_url, textureAtlas, imageLoader) {
		const cols = textureAtlas.cols;
		const rows = textureAtlas.rows;
		const tag = assetMd5[collision_url.split("/").pop()];
		if (this.collisionData[tag]) {
			return this.collisionData[tag];
		}
		console.log("Calculating collision box on: " + collision_url + "(" + tag + ")");
		const canvas = imageLoader.canvas;
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
						top: top / cellHeight,
						left: left / cellWidth,
						bottom: bottom / cellHeight,
						right: right / cellWidth,
						close: 0, far: 1,
					};
				}
			}
		}

		this.collisionData[tag] = collisionBoxes;
		this.directData.didChange(COLLISION_BOX_CALCULATOR_DATA_PATH);
		return collisionBoxes;
	}	
}