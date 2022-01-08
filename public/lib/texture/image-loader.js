class ImageLoader {
	constructor() {
		this.imageStock = {};
		this.preserve = {
			"assets/mouse-cursor.png": true,
			"assets/pointer-cursor.png": true,
			"assets/button_e.png": true,
			"assets/button_q.png": true,
		};
		this.canvas = document.createElement("canvas");
	}

	async getBlobUrl(url) {
		await this.loadImage(url);
		return this.preserve[url] ? this.imageStock[url]?.img.src : null; 
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
								if (!this.preserve[url]) {
									URL.revokeObjectURL(imageURL);
								}
								this.imageStock[url].progress = 1;
								this.imageStock[url].loaded = true;
								const listeners = this.imageStock[url].onLoadListeners;
								delete this.imageStock[url].onLoadListeners;
								resolve(img);
								listeners.forEach(callback => callback(img));
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
}
