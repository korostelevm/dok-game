class MouseHandlerManager {
	constructor(document, canvas, engine) {
		this.engine = engine;
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
		this.buttons = 0;
		this.hovered = new Set();
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
			if (mouseHandler.activationListeners) {
				mouseHandler.activationListeners.add(this.onActivationListener);
			}
		}
	}

	remove(mouseHandler) {
		this.handlerSet.delete(mouseHandler);
		if (!this.handlerSet.size) {
			this.removeMouseListeners();
		}
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
		this.mouseX = (e.pageX - this.rect.x) / this.rect.width * this.engine.viewportWidth,
		this.mouseY = (e.pageY - this.rect.y) / this.rect.height * this.engine.viewportHeight;
		this.buttons = e.buttons;

		this.hovered.clear();
		for (let mouseHandler of this.handlerSet) {
			if (mouseHandler.getCollisionBox && mouseHandler.getCollisionBox().containsPoint2d(this.mouseX, this.mouseY)) {
				this.hovered.add(mouseHandler);
			}
		}

		for (let mouseHandler of this.handlerSet) {
			mouseHandler.handleMouse(e, this.mouseX, this.mouseY, this.hovered);
		}
		if (this.forceRefreshOnMouse) {
			engine.forceRefresh();
		}
	}

	setForceRefreshOnMouse(value) {
		this.forceRefreshOnMouse = value;
	}
}