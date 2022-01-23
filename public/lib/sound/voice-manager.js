class VoiceManager {
	constructor() {
		this.defaultVoiceReplacement = localStorage.getItem("defaultVoiceReplacement");
		this.voiceReplacements = {};
	}

	async init() {
		this.voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];		
	}

	bestVoice(voices, voiceName) {
		if (this.voiceReplacements[voiceName]) {
			return this.voiceReplacements[voiceName];
		}
		for (let i = 0; i < voices.length; i++) {
			if (voices[i].lang.startsWith("en")) {
				return this.voiceReplacements[voiceName] = voices[i];
			}
		}
		return this.voiceReplacements[voiceName] = voices[Math.floor(Math.random() * voices.length)];
	}

	getUterrance(msg, voiceName, mainCharacter) {
		if (!window.speechSynthesis || this.muteVoice) {
			return null;
		}
		if (!this.voices || !this.voices.length) {
			this.voices = window.speechSynthesis.getVoices();
			speechSynthesis.addEventListener("voicechanged", console.log);
		}

		const voices = this.voices;
		const voiceNames = Array.isArray(voiceName) ? voiceName : [voiceName];
		let voice = null;
		let lowestIndex = voices.length - 1;
		for (let i = 0; i < voices.length; i++) {
			const index = voiceNames.indexOf(voices[i].name);
			if (index >= 0 && index < lowestIndex) {
				voice = voices[i];
				lowestIndex = index;
			}
		}
		let replacedVoice = false;
		if (!voice) {
			voice = this.bestVoice(this.voices, voiceNames[0]);
			replacedVoice = true;
		}
		if (this.defaultVoiceReplacement && this.defaultVoiceReplacement !== "default" && mainCharacter && localStorage.getItem("alternate_voices")) {
			for (let voice of voices) {
				if (theVoice.name === this.defaultVoiceReplacement && theVoice !== voice) {
					voice = theVoice;
				}
			}
			replacedVoice = true;
		}
//		console.log(this.defaultVoiceReplacement, replacedVoice);
		if (!voice) {
			return null;
		}

		if (!this.utterrances) {
			this.utterrances = {};
		}
		if (!this.utterrances[voice.name]) {
			this.utterrances[voice.name] = new SpeechSynthesisUtterance();
			this.utterrances[voice.name].voice = voice;
			// console.log(voice);
		}
		const utterance = this.utterrances[voice.name];
		utterance.text = TranslateVoice.getPhoneme(msg, voice.name);
		utterance.replacedVoice = replacedVoice;
		return utterance;
	}

	swapVoice(voice) {
		this.defaultVoiceReplacement = voice;
		localStorage.setItem("defaultVoiceReplacement", voice);
	}	
}