class CursorManager {
	constructor(engine) {
		this.engine = engine;
		this.sheet = (() => {
			const style = document.createElement("style");
			style.appendChild(document.createTextNode(""));
			document.head.appendChild(style);
			return style.sheet;
		})();
		this.iconEmojis = {};
		this.addEmojiRule("happy", "😀");
	}

	addEmojiRule(id, emoji) {
		if (!this.iconEmojis[id]) {
			this.iconEmojis[id] = true;
			this.sheet.insertRule(`#overlay.cursor-${id} { cursor:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'  width='32' height='32' viewport='0 0 64 64' style='fill-opacity:0.4;stroke:white;fill:white;font-size:18px;'><circle cx='50%' cy='50%' r='10'/><line x1='16' y1='0' x2='8' y2='10' style='stroke:rgb(255,255,255);stroke-width:1' /><line x1='16' y1='0' x2='24' y2='10' style='stroke:rgb(255,255,255);stroke-width:1' /><text x='8' y='24'>${emoji}</text></svg>") 16 0,auto; }`,
				this.sheet.rules.length);
			this.sheet.insertRule(`#overlay.cursor-${id}.highlight { cursor:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'  width='32' height='32' viewport='0 0 64 64' style='fill-opacity:0.4;stroke:yellow;fill:yellow;font-size:18px;stroke-width:3'><circle cx='50%' cy='50%' r='10'/><line x1='16' y1='0' x2='8' y2='10' style='stroke:rgb(255,255,0);stroke-width:3' /><line x1='16' y1='0' x2='24' y2='10' style='stroke:rgb(255,255,0);stroke-width:3' /><text x='8' y='24'>${emoji}</text></svg>") 16 0,auto; }`,
				this.sheet.rules.length);
		}
	}

	setCursor(id, highlight) {
		if (this.cursorId === id && this.cursorHighlight === highlight) {
			return;
		}
		this.cursorId = id;
		this.cursorHighlight = highlight;
		const classList = this.engine.overlay.classList;
		for (let i = 0; i < classList.length; i++) {
			const c = classList[i];
			if (c.startsWith("cursor-")) {
				classList.remove(classList[i]);
			}
		}
		if (id) {
			classList.add(`cursor-${id}`);
		}
		if (highlight) {
			classList.add('highlight');
		} else {
			classList.remove('highlight');
		}
	}

	async changeCursor(cursor, cantWait) {
		const overlay = this.engine.overlay;
		if (overlay && overlay.style.cursor !== cursor) {
			overlay.style.cursor = cursor;
			if (!cantWait) {
				await this.engine.wait(500);
			}
		}
	}
}