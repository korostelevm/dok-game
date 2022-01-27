class DragDrop {
	constructor(game) {
		this.game = game;
		this.engine = game.engine;
		this.overlay = this.engine.overlay;
		this.onDragOverCallback = event => this.onDragOver(event);
		this.onDropCallback = event => this.onDropOnOverlay(event);
	}

	async init() {
		const dropArea = document.body;
		dropArea.addEventListener('dragover', this.handlerFunction, false);
		dropArea.addEventListener('drop', this.handlerFunction, false);
		this.setupDragListeners();

		this.overlay.addEventListener("drop", this.onDropCallback);
		this.overlay.addEventListener("dragover", this.onDragOverCallback);
	}

	clear() {
		const dropArea = document.body;
		dropArea.removeEventListener('dragover', this.handlerFunction);
		dropArea.removeEventListener('drop', this.handlerFunction);
		this.removeDragListeners();
		this.overlay.removeEventListener("drop", this.onDropCallback);
		this.overlay.removeEventListener("dragover", this.onDragOverCallback);
	}

	handlerFunction(e) {
		e.preventDefault();
		e.stopPropagation();
	}

	setupDragListeners() {
		if (this.game.onDropOnOverlay) {
			this.overlay.addEventListener("drop", this.onDropOnOverlay);
		}
		if (this.game.onDragOver) {
			this.overlay.addEventListener("dragover", this.onDragOver);
		}
	}

	removeDragListeners() {
		if (this.overlay) {
			this.overlay.removeEventListener("drop", this.onDropOnOverlay);
			this.overlay.removeEventListener("dragover", this.onDragOver);
		}
	}

	onDropOnOverlay(event) {
		if (this.game && this.game.onDropOnOverlay) {
			this.game.onDropOnOverlay(event);
		}
	}

	onDragOver(event) {
		if (this.game && this.game.onDragOver) {
			this.game.onDragOver(event);
		}
	}
}
