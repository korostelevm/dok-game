class MouseHandlerManager {
	constructor(document, canvas) {
		this.canvas = canvas;
		this.document = document;
		this.handlerSet = new Set();
		this.handleMouseCallback = null;
		this.resizeObserver = new ResizeObserver(() => {
			this.rect = null;
		});
		this.resizeObserver.observe(this.canvas);
	}

	recalculateSize() {
		this.rect = this.canvas.getBoundingClientRect();
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
		this.handlerSet.clear();
		this.removeMouseListeners();
	}


	setupMouseListeners() {
		this.removeMouseListeners();
		this.handleMouseCallback = e => this.handleMouseAction(e);
		this.document.addEventListener("click", this.handleMouseCallback);
		this.document.addEventListener("mousedown", this.handleMouseCallback);
		this.document.addEventListener("mousemove", this.handleMouseCallback);
		this.document.addEventListener("mouseup", this.handleMouseCallback);
		this.document.addEventListener("mouseleave", this.handleMouseCallback);
	}

	removeMouseListeners() {
		if (this.handleMouseCallback) {
			this.document.removeEventListener("click", this.handleMouseCallback);
			this.document.removeEventListener("mousedown", this.handleMouseCallback);
			this.document.removeEventListener("mousemove", this.handleMouseCallback);
			this.document.removeEventListener("mouseup", this.handleMouseCallback);
			this.document.removeEventListener("mouseleave", this.handleMouseCallback);
			delete this.handleMouseCallback;
		}
	}

	handleMouseAction(e) {
		if (!this.rect) {
			this.recalculateSize();
		}
		const x = (e.pageX - this.rect.x) / this.rect.width * this.canvas.offsetWidth,
			  y = (e.pageY - this.rect.y) / this.rect.height * this.canvas.offsetHeight;
		for (let mouseHandler of this.handlerSet) {
			mouseHandler.handleMouse(mouseHandler, e, x, y);
		}
		engine.forceRefresh();
	}
}