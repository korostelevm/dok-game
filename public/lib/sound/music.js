class Music {
	constructor(engine) {
		this.engine = engine;
		this.songByUrl = {};
	}

	async preload(songs) {
		return Promise.all(songs.map(mp3 => this.load(mp3)));
	}

	async load(mp3) {
		return new Promise((resolve, reject) => {
			if (this.songByUrl[mp3] && this.songByUrl[mp3].loaded) {
				resolve(this.songByUrl[mp3].audio);
				return;
			} else {
				const audio = new Audio();
				this.songByUrl[mp3] = {
					audio,
				};
				audio.currentTime = 0;
				audio.loop = true;
				audio.addEventListener("error", e => {
					console.error("Unable to load: " + mp3);
				});
			}
			this.songByUrl[mp3].audio.addEventListener("canplay", () => {
				this.songByUrl[mp3].loaded = true;
				resolve(this.songByUrl[mp3].audio);
			});
			this.songByUrl[mp3].audio.src = mp3;
		});
	}

	async getAudio(mp3) {
		return await this.load(mp3);
	}
}
