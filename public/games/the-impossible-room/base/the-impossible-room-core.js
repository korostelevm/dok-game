class TheImpossibleRoomCore extends GameCore {
	constructor(engine) {
		super(engine);
		this.sidebar = new Sidebar(engine, document.getElementById("sidebar"), document);
		this.voiceManager = new VoiceManager();
		this.playerOverlay = new PlayerOverlay(engine, this);
	}

	async init() {
		await super.init();
		await this.voiceManager.init();
	}

	async onExit(engine) {
		await super.onExit(engine);
		this.sidebar.setVisible(false);
	}

	onPostScore(score) {
		this.sidebar.updateSidebar(this.game.sceneTag, localStorage.getItem("joker"));
	}
}