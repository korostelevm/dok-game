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
		this.onActivationListener = (mouseHandler, active) => {
			if (!active) {
				this.remove(mouseHandler);
			} else {
				this.add(mouseHandler);
			}
		};
		this.mouseX = 0;
		this.mouseY = 0;
	}

	recalculateSize() {
		this.rect = this.canvas.getBoundingClientRect();
	}

	add(mouseHandler) {
		if (!this.handleMouseCallback) {
			this.setupMouseListeners();
		}
		if (!this.handlerSet.has(mouseHandler)) {
			this.handlerSet.add(mouseHandler);
			if (mouseHandler.addActivationListener) {
				mouseHandler.addActivationListener(this.onActivationListener);
			}
		}
	}

	remove(mouseHandler) {
		if (!this.handlerSet.size) {
			this.removeMouseListeners();
		}
		this.handlerSet.delete(mouseHandler);
	}

	clear() {
		this.handlerSet.clear();
		this.removeMouseListeners();
		this.setForceRefreshOnMouse(false);
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
		this.mouseX = (e.pageX - this.rect.x) / this.rect.width * this.canvas.offsetWidth,
		this.mouseY = (e.pageY - this.rect.y) / this.rect.height * this.canvas.offsetHeight;
		for (let mouseHandler of this.handlerSet) {
			mouseHandler.handleMouse(mouseHandler, e, this.mouseX, this.mouseY);
		}
		if (this.forceRefreshOnMouse) {
			engine.forceRefresh();
		}
	}

	setForceRefreshOnMouse(value) {
		this.forceRefreshOnMouse = value;
	}
}