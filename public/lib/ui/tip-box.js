class TipBox {
	constructor(canvas) {
		this.id = null;
		this.messages = {};
		this.div = document.getElementById("tip-box") || canvas.parentElement.insertBefore(document.createElement("div"), canvas.nextSibling);
		this.div.id = "tip-box";
		this.div.style.position = "absolute";
		this.div.style.top = `${canvas.getBoundingClientRect().bottom - 50}px`;
		this.div.style.fontSize = "18pt";
		this.div.style.transitionProperty = "opacity";
		this.div.style.transitionDuration = ".2s";
		this.div.style.opacity = 0;
		this.div.style.color = "white";
		this.div.style.textShadow = "1px 1px black";


		this.imageReplacements = {
			"E": "assets/button_e.png",
		};
		Object.keys(this.imageReplacements).forEach(key => {
			const img = new Image();
			img.addEventListener("load", e => this.imageReplacements[key] = img.src);
			img.src = this.imageReplacements[key];
		});
	}

	showMessage(id, message) {
		this.messages[id] = message;
		this.#displayMessage(id, message);
	}

	clearMessage(id) {
		delete this.messages[id];
		let idToShow = null;
		let messageToShow = null;
		for (let i in this.messages) {
			idToShow = i;
			messageToShow = this.messages[i];
		}

		if (this.id === id) {
			this.#displayMessage(idToShow, messageToShow);
		}
	}

	#displayMessage(id, message) {
		this.id = id;
		if (message) {
			this.div.innerHTML = message.split("[E]").join(`<image style="width: 21px; height: 21px; vertical-align: middle" src="assets/button_e.png">`);
		}
		this.div.style.opacity = message ? 1 : 0;
	}
}