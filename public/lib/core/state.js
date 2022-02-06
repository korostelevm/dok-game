class State extends Active {
	constructor(name, config, game) {
		super();
		this.name = name;
		this.config = config;
		this.game = game;
		this.actionManager = new ActionManager(this);
	}

	applyStateChange() {
		this.actionManager.applyStateChange(this);		
	}
}