class PlayerOverlay {
	constructor(engine, core) {
		this.engine = engine;
		this.core = core;
		this.init();
	}

	init() {
		const gender = localStorage.getItem("playerGender") || "M";
		this.changeCharacter(gender === "W" ? "nuna" : gender === "T" ? "twin" : "monkor");

		const backButton = document.getElementById("back-button");
		backButton.addEventListener("click", () => {
			this.setInception(false);
		});		
	}

	changeCharacter(character) {
		document.getElementById("player-overlay").src = `assets/${character}-overlay.png`;
	}

	setInception(inception, extraData, nextScene) {
		this.inception = inception;
		const temp = this.core.swapData || {};
		this.core.swapData = this.core.data;
		this.core.data = temp;
		if (extraData) {
			for (let i in extraData) {
				this.core.data[i] = extraData[i];
			}
		}

		const TempScene = nextScene || this.core.SwapScene || StartScreen;
		this.core.SwapScene = this.engine.game.constructor;
		this.engine.setGame(new TempScene(), true).then(game => {
			game.onInception(inception);
		});
		if (inception) {
			this.engine.canvas.parentElement.classList.add("inception");
		} else {
			this.engine.canvas.parentElement.classList.remove("inception");
		}
		this.engine.mouseHandlerManager.rect = null;

		document.getElementById("player-overlay").style.display = inception ? "" : "none";
		document.getElementById("back-button").style.display = inception ? "" : "none";
		doResize();
	}
}