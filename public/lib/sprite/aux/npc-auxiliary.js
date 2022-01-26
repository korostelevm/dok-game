class NpcAuxiliary extends Auxiliary {
	constructor(config, sprite) {
		super(config, sprite);
		sprite.collide = 1;
		sprite.npc = 1;
		sprite.noblock = 1;
		sprite.onChat = this.onChat;
	}

	onChat(self, sprite, forceChat) {
		const shouldChat = forceChat ?? !sprite.chatting;
		sprite.chatting = shouldChat ? self.engine.lastTime : 0;
		self.game.camera = shouldChat ? "zoom" : "normal";
		if (self.game.overlayHud) {
			self.game.overlayHud.visible = shouldChat;
		}
	}
}