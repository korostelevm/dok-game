class DebugView {
	constructor(engine) {
		this.engine = engine;
		this.debugCanvas = document.createElement("canvas");
		this.debugCanvas.style.position = "absolute";
		this.debugCanvas.zIndex = 1;
		document.getElementById("container").appendChild(this.debugCanvas);
		this.debugCtx = this.debugCanvas.getContext("2d");
		this.debugCanvas.style.display = "none";
		addEventListener('error', function(event) {
			const div = document.body.appendChild(document.createElement("div"));
			div.id = "errorView";
			div.style.position = "absolute";
			div.style.top = "0px";
			div.style.left = "0px";
			div.style.userSelect = "none";
			div.style.pointerEvents = "none";
			div.style.color = "#FF0000cc";
			div.style.backgroundColor = "#660000aa";
			div.style.zIndex = 200;
			div.textContent = event.error.stack;
			div.style.op
		});
	}

	drawCollisionBox(ctx, sprite, time, zoom) {
		const { config: { viewport: { pixelScale } } } = this.engine;
		const rect = sprite.disabled ? null : sprite.getCollisionBox(time);
		if (!rect) {
			return;
		}
		ctx.beginPath();
		ctx.globalAlpha = sprite.opacity > 0 ? 1 : .2;
		ctx.rect(rect.left / pixelScale / zoom, rect.top / pixelScale / zoom, (rect.right - rect.left) / pixelScale / zoom - 1, (rect.bottom - rect.top) / pixelScale / zoom - 1);
		ctx.stroke();
	}

	showDebugCanvas(time, canvas) {
		const { engine } = this;
		const zoom = 4;
		if (!this.debugCanvasInited) {
			this.debugCanvas.style.outline = "2px solid pink";
			this.debugCanvas.width = canvas.width / zoom;
			this.debugCanvas.height = canvas.height / zoom;
			this.debugCanvas.style.width = `${canvas.offsetWidth - zoom}px`;
			this.debugCanvas.style.height = `${canvas.offsetHeight - zoom}px`;
			this.debugCanvas.style.left = `${canvas.offsetLeft}px`;
			this.debugCanvas.style.top = `${canvas.offsetTop}px`;
			this.debugCanvas.style.display = "";

		}
		const ctx = this.debugCtx;
		const { config: { viewport: { pixelScale } } } = engine;
		const margin = 10 / pixelScale / zoom;
		ctx.clearRect(0, 0, this.debugCanvas.width, this.debugCanvas.height);
		ctx.beginPath();
		ctx.rect(margin, margin, this.debugCanvas.width - margin * 2, this.debugCanvas.height - margin * 2);
		ctx.stroke()

		ctx.strokeStyle = "#FF0000";

		for (let i = 0; i < engine.spriteCollection.size(); i++) {
			const sprite = engine.spriteCollection.get(i);
			this.drawCollisionBox(ctx, sprite, time, zoom);
		}

		ctx.globalAlpha = "";
	}
}