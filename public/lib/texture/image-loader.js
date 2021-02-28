class ImageLoader {
	constructor() {
		this.imageStock = {};
	}

	async preloadImages(...urls) {
		return Promise.all(urls.map(async url => {
			return await this.loadImage(url);
		}));
	}

	async loadImage(url) {
		return new Promise((resolve, reject) => {
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
}
