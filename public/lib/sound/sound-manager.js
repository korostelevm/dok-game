class SoundManager {
	constructor() {
		this.soundCache = {};
	}

	getSound(url, volume) {
		if (!this.soundCache[url]) {
			this.soundCache[url] = new Sound(url);
		}
		this.soundCache[url].setDefaultVolume(volume);
		return this.soundCache[url];
	}
}