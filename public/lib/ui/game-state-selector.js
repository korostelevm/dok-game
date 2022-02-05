class GameStateSelector extends UiComponent {
	constructor(engine) {
		super(engine);
		this.div = document.getElementById("container").appendChild(document.createElement("div"));
		this.div.style.position = "absolute";
		this.div.style.left = "5px";
		this.div.style.bottom = "20px";
		this.div.style.display = "none";
		this.div.style.zIndex = "100";

		const label = this.div.appendChild(document.createElement("label"));
		this.selector = this.div.appendChild(document.createElement("select"));
		this.selector.id = "state-selector";
		this.selector.addEventListener("change", e => {
			this.game.changeState(this.selector.value);
		});

		label.textContent = "state ";
		label.setAttribute("for", this.selector.id);

		engine.gameChangeListener.add(this);
	}

	onGameChange(game) {
		if (this.game) {
			this.game.stateListeners.delete(this);
		}
		this.game = game;
		this.selector.textContent = "";
		for (let state of Object.keys(game.states)) {
			const option = document.createElement("option");
			option.text = state;
			option.value = state;
			this.selector.add(option);
		}
		this.div.style.display = Object.keys(game.states).length ? "" : "none";
		this.selector.value = game.state;

		game.stateListeners.add(this);
	}

	onState(state) {
		this.selector.value = state;
	}
}