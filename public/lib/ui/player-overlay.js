class PlayerOverlay extends UiComponent {
	constructor(engine) {
		super(engine);
	}

	init() {
		const gender = localStorage.getItem("playerGender") || "M";
		this.changeCharacter(gender === "W" ? "nuna" : gender === "T" ? "twin" : "monkor");

		document.getElementById("back-button");
		backButton.addEventListener("click", () => {
			this.setInception(false);
		});		
	}

	changeCharacter(character) {
		document.getElementById("player-overlay").src = `assets/${character}-overlay.png`;
	}

	setInception(inception, extraData) {
		this.inception = inception;
		const temp = this.engine.swapData || {};
		this.engine.swapData = this.engine.data;
		this.engine.data = temp;
		if (extraData) {
			for (let i in extraData) {
				this.engine.data[i] = extraData[i];
			}
		}

		const TempScene = this.engine.SwapScene || StartScreen;
		this.engine.SwapScene = this.engine.game.constructor;
		this.engine.setGame(new TempScene(), true).then(game => {
			game.onInception(inception);
		});
		if (inception) {
			this.engine.canvas.parentElement.classList.add("inception");
		} else {
			this.engine.canvas.parentElement.classList.remove("inception");
		}

		document.getElementById("player-overlay").style.display = inception ? "" : "none";
		document.getElementById("back-button").style.display = inception ? "" : "none";
		doResize();
	}
}