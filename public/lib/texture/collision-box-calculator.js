class CollisionBoxCalculator {
	constructor(datastore) {
		this.collisionBoxesPerTag = {};
		this.datastore = datastore;
	}

	async calculateCollisionBoxes(collision_url, textureAtlas, imageLoader) {
		const cols = textureAtlas.cols;
		const rows = textureAtlas.rows;
		const md5 = assetMd5[collision_url.split("/").pop()];
		const tag = `${md5}_${rows}_${cols}`;
		if (this.collisionBoxesPerTag[tag]) {
			return this.collisionBoxesPerTag[tag];
		}
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
						top, left, bottom, right, cellWidth, cellHeight,
					};
				}
			}
		}

		const normalizedBoxes = collisionBoxes.map(({ top, left, bottom, right, cellWidth, cellHeight }) => {
			return {
				top: top / cellHeight,
				left: left / cellWidth,
				bottom: bottom / cellHeight,
				right: right / cellWidth,
				close: 0,
				far: 1,
			};
		});
		this.collisionBoxesPerTag[tag] = normalizedBoxes;
		return normalizedBoxes;
	}	
}