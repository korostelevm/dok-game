class DebugView {
	constructor(engine) {
		if (!engine.debug) {
			return;
		}
		engine.addOnPostRefresh(this);
		this.engine = engine;
		this.debugCanvas = document.createElement("canvas");
		this.debugCanvas.style.position = "absolute";
		this.debugCanvas.zIndex = 1;
		this.debugCtx = this.debugCanvas.getContext("2d");
		this.debugCanvas.style.display = "none";
	}

	drawCollisionBox(ctx, sprite, time, canvasZoom, shift) {
		const { config: { viewport: { pixelScale } } } = this.engine;
		const rect = sprite.disabled ? null : sprite.getCollisionBox(time);
		if (!rect) {
			return;
		}
		ctx.beginPath();
		ctx.globalAlpha = sprite.opacity > 0 ? 1 : .2;
		ctx.rect((rect.left + shift.x / 2) / pixelScale / canvasZoom,
			(rect.top + shift.y / 2) / pixelScale / canvasZoom,
			(rect.right - rect.left) / pixelScale / canvasZoom - 1,
			(rect.bottom - rect.top) / pixelScale / canvasZoom - 1);
		ctx.stroke();
	}

	init() {
	}

	showDebugCanvas(time, canvas, shift) {
		const { engine } = this;
		const canvasZoom = 4;
		if (!this.debugCanvasInited) {
			this.debugCanvasInited = true;
			this.debugCanvas.style.outline = "2px solid pink";
			this.debugCanvas.id = "debug-canvas";
			this.debugCanvas.width = canvas.width / canvasZoom;
			this.debugCanvas.height = canvas.height / canvasZoom;
			this.debugCanvas.style.width = `${canvas.offsetWidth - canvasZoom}px`;
			this.debugCanvas.style.height = `${canvas.offsetHeight - canvasZoom}px`;
			this.debugCanvas.style.left = `${canvas.offsetLeft}px`;
			this.debugCanvas.style.top = `${canvas.offsetTop}px`;
			this.debugCanvas.style.display = "";
			document.getElementById("container").appendChild(this.debugCanvas);

			const checkbox = document.getElementById("container").appendChild(document.createElement("input"));
			checkbox.type = "checkbox";
			checkbox.style.position = "absolute";
			checkbox.style.top = `${this.debugCanvas.getBoundingClientRect().bottom + 10}px`;
			checkbox.style.zIndex = "300";
			checkbox.addEventListener("change", e => {
				if (checkbox.checked) {
					localStorage.setItem("showDebugView", true);
				} else {
					localStorage.removeItem("showDebugView");
				}
				this.debugCanvas.style.display = checkbox.checked ? "" : "none";
				this.visible = checkbox.checked;
			});
			checkbox.checked = localStorage.getItem("showDebugView");
			this.visible = checkbox.checked;
			this.debugCanvas.style.display = checkbox.checked ? "" : "none";
		}
		if (!this.visible) {
			return;
		}
		const ctx = this.debugCtx;
		const { config: { viewport: { pixelScale } } } = engine;
		const margin = 10 / pixelScale / canvasZoom;
		ctx.clearRect(0, 0, this.debugCanvas.width, this.debugCanvas.height);
		ctx.beginPath();
		ctx.rect(margin, margin, this.debugCanvas.width - margin * 2, this.debugCanvas.height - margin * 2);
		ctx.stroke()

		ctx.strokeStyle = "#FF0000";

		for (let i = 0; i < engine.spriteCollection.size(); i++) {
			const sprite = engine.spriteCollection.get(i);
			this.drawCollisionBox(ctx, sprite, time, canvasZoom, shift);
		}

		ctx.globalAlpha = "";
	}

	onRefresh(time, dt) {
		this.showDebugCanvas(time, this.engine.canvas, this.engine.shift);
	}
}