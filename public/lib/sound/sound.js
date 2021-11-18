class Sound {
	constructor(src, volume) {
		this.audios = [];
		this.src = src;
		this.volume = volume;
		this.prepare();
	}

	prepare() {
		if (!this.audios.length) {
			const audio = new Audio();
			audio.src = this.src;
			this.audios.push(audio);
			audio.addEventListener("ended", () => {
				audio.currentTime = 0;
				this.audios.push(audio);
			});
		}
	}

	loop(volume) {
		if (Sound.mute) {
			return;
		}
		if (!this.looper) {
			const audio = this.audios.pop();
			audio.loop = true;
			this.looper = audio;
		}
		this.looper.volume = volume ?? this.volume;
		this.looper.play();
	}

	stop() {
		if (this.looper) {
			this.looper.pause();
			this.looper.loop = false;
			this.looper.currentTime = 0;
			this.audios.push(this.looper);
			this.looper = null;
		}
	}

	play(volume, callback) {
		if (Sound.mute) {
			return;
		}
		const audio = this.audios.pop();
		if (audio) {
			audio.volume = volume ?? this.volume;
			audio.play();
		}
		this.prepare();
	}
}
