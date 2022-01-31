class Sound {
	constructor(src, volume) {
		this.audios = [];
		this.src = src;
		this.volume = volume ?? 1;
		this.prepare();
	}

	setDefaultVolume(volume) {
		this.volume = volume ?? 1;
	}

	prepare() {
		if (!this.audios.length) {
			const audio = new Audio();
			audio.src = this.src;
			this.audios.push(audio);
			audio.addEventListener("ended", () => {
				audio.currentTime = 0;
				this.audios.push(audio);
				if (this.playingAudio === audio) {
					this.playingAudio = null;
				}
			});
		}
	}

	loop(volume) {
		if (Sound.mute) {
			return;
		}
		if (!this.playingAudio) {
			const audio = this.audios.pop();
			audio.loop = true;
			this.playingAudio = audio;
		}
		this.playingAudio.volume = volume ?? this.volume;
		this.playingAudio.play();
	}

	stop() {
		if (this.playingAudio) {
			this.playingAudio.pause();
			this.playingAudio.loop = false;
			this.playingAudio.currentTime = 0;
			this.audios.push(this.playingAudio);
			this.playingAudio = null;
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
			this.playingAudio = audio;
		}
		this.prepare();
	}
}
