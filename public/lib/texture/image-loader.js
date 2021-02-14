class ImageLoader {
	constructor() {
		this.imageStock = {};
	}


	async loadImage(url) {
		return new Promise((resolve, reject) => {
			if (this.imageStock[url]) {
				const { img } = this.imageStock[url];
				if (!img.complete) {
					img.addEventListener("load", () => {
						resolve(img);
					});
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