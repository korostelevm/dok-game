class ImageLoader {
	constructor() {
		this.imageStock = {};
		this.collisionBoxes = {};
		this.canvas = document.createElement("canvas");
	}

	unload() {
		this.unloadStockExceptUrls([]);
	}

	unloadStockExceptUrls(exceptUrls) {
		const hash = {};
		exceptUrls.forEach(url => hash[url] = true);
		for (let url in this.imageStock) {
			if (!hash[url]) {
				delete this.imageStock[url];
			}
		}
	}

	async preloadImages(...urls) {
		return Promise.all(urls.map(async url => {
			return await this.loadImage(url);
		}));
	}

	async loadImage(url) {
		return !url ? Promise.resolve(null) : new Promise((resolve, reject) => {
			if (this.imageStock[url]) {
				const { img, loaded, onLoadListeners } = this.imageStock[url];
				if (!loaded) {
					onLoadListeners.push(resolve);
				} else {
					resolve(img);
				}
			} else {
			    const req = new XMLHttpRequest();
			    const img = new Image();
			    this.imageStock[url] = {
			    	img,
			    	url,
			    	progress: 0,
			    	onLoadListeners: [],
			    };
			    req.open('GET', url);
		        req.responseType = 'blob';

			    req.addEventListener('load', e => {
			    	if (req.status === 200) {
						if (url.match(/.(jpg|jpeg|png|gif)$/i)) {
							const imageURL = URL.createObjectURL(req.response);
							const { img } = this.imageStock[url];
							img.addEventListener("load", e => {
								URL.revokeObjectURL(imageURL);
								resolve(img);
								this.imageStock[url].progress = 1;
								this.imageStock[url].loaded = true;
								this.imageStock[url].onLoadListeners.forEach(callback => callback(img));
								delete this.imageStock[url].onLoadListeners;
							});
							img.src = imageURL;
						} else {
							reject(new Error("Invalid image."));
						}
					}
					else {
						reject(new Error(`Url could not load: ${url}`));
					}
			    });
			    req.addEventListener('error', e => {
			    	reject(new Error("Network Error"));
			    });
			    req.addEventListener('progress', e => {
			    	this.imageStock[url].progress = e.loaded / e.total;
			    });
				req.send();
			}
		});
	}

	async calculateCollisionBoxes(collision_url, textureAtlas) {
		const tag = `${collision_url}_${textureAtlas.rows}_${textureAtlas.cols}`;
		if (this.collisionBoxes[tag]) {
			return this.collisionBoxes[tag];
		}
		const { canvas } = textureAtlas;
		const collisionBoxes = [];
		const collisionImage = await this.loadImage(collision_url);
		canvas.width = collisionImage.naturalWidth;
		canvas.height = collisionImage.naturalHeight;
		const context = canvas.getContext("2d");
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.drawImage(collisionImage, 0, 0);

		for (let row = 0; row < textureAtlas.rows; row++) {
			for (let col = 0; col < textureAtlas.cols; col++) {
				const cellWidth = canvas.width / textureAtlas.cols;
				const cellHeight = canvas.height / textureAtlas.rows;
				const cellX = col * cellWidth;
				const cellY = row * cellHeight;
				const top = textureAtlas.getTop(context, cellX, cellY, cellWidth, cellHeight) / cellHeight;
				if (top < 0) {
					continue;
				}
				const bottom = (textureAtlas.getBottom(context, cellX, cellY, cellWidth, cellHeight) + 1) / cellHeight;
				const left = textureAtlas.getLeft(context, cellX, cellY, cellWidth, cellHeight) / cellWidth;
				const right = (textureAtlas.getRight(context, cellX, cellY, cellWidth, cellHeight) + 1) / cellWidth;
				if (top >= 0 && bottom >= 0 && left >= 0 && right >= 0) {
					collisionBoxes[row * textureAtlas.cols + col] = {
						top, left, bottom, right,
					};
				}
			}
		}
		this.collisionBoxes[tag] = collisionBoxes;
		return collisionBoxes;
	}	
}
