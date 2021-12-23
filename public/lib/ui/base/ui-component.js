class UiComponent {
	constructor(engine) {
		this.engine = engine;
		if (engine) {
			engine.addUiComponent(this);
		}
	}

	async init() {
	}
}