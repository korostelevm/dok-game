class TheImpossibleRoomCore extends GameCore {
	constructor(engine) {
		super(engine);
		this.sidebar = new Sidebar(engine, document.getElementById("sidebar"), document);
		this.voiceManager = new VoiceManager();
	}

	async init() {
		await this.voiceManager.init();
	}

	onPostScore(score) {
		this.sidebar.updateSidebar(this.game.sceneTag, localStorage.getItem("joker"));
	}
}