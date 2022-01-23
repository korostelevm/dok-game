class MouseHandlerManager {
	constructor() {
		this.handlerSet = new Set();
		this.handleMouseCallback = null;
	}

	add(mouseHandler) {
		if (!this.handleMouseCallback) {
			this.setupMouseListeners();
		}
		this.handlerSet.add(mouseHandler);
	}

	remove(mouseHandler) {
		if (!this.handlerSet.size) {
			this.removeMouseListeners();
		}
	}

	clear() {
		this.handler.clear();
		this.removeMouseListeners();
	}


	setupMouseListeners() {
		this.removeMouseListeners();
		this.handleMouseCallback = e => this.handleMouse(e);
		document.addEventListener("click", this.handleMouseCallback);
		document.addEventListener("mousedown", this.handleMouseCallback);
		document.addEventListener("mousemove", this.handleMouseCallback);
		document.addEventListener("mouseup", this.handleMouseCallback);
		document.addEventListener("mouseleave", this.handleMouseCallback);
	}

	removeMouseListeners() {
		if (this.handleMouseCallback) {
			document.removeEventListener("click", this.handleMouseCallback);
			document.removeEventListener("mousedown", this.handleMouseCallback);
			document.removeEventListener("mousemove", this.handleMouseCallback);
			document.removeEventListener("mouseup", this.handleMouseCallback);
			document.removeEventListener("mouseleave", this.handleMouseCallback);
			delete this.handleMouseCallback;
		}
	}

	handleMouse(e) {
		for (let mouseHandler of this.handlerSet) {
			mouseHandler(e);
		}
	}
}