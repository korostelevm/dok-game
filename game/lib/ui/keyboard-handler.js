/**
	Dok-game engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-game
	Year: 2020
 */

/*
 *	Keyboard Handler
 */
class KeyboardHandler {
	constructor(document) {
		const listeners = {};
		const keys = {};
		document.addEventListener("keydown", e => {
			if (!keys[e.key]) {
				keys[e.key] = true;
				const listener = listeners[e.key] || listeners[null];
				if (listener && listener["down"]) {
					listener["down"].forEach(f => f(e));
				}
			}
		});
		document.addEventListener("keyup", e => {
			this.keys[e.key] = false;
			const listener = listeners[e.key] || listeners[null];
			if (listener && listener["up"]) {
				listener["up"].forEach(f => f(e));
			}
		});
		this.listeners = listeners;
		this.keys = keys;
	}

	addKeyListener(key, type, onKey) {
		if (Array.isArray(key)) {
			key.forEach(k => this.addKeyListener(k, type, onKey));
			return;
		}
		this.listeners[key] = (this.listeners[key] || {});
		this.listeners[key][type] = (this.listeners[key][type]||[]).concat(onKey);
	}

	addKeyDownListener(key, onKey) {
		this.addKeyListener(key, "down", onKey);
	}

	addKeyUpListener(key, onKey) {
		this.addKeyListener(key, "up", onKey);
	}

	removeListener(listener) {
		for (let i in this.listeners) {
			if (this.listeners[i]["up"]) {
				this.listeners[i]["up"] = this.listeners[i]["up"].filter(l => l !== listener);
			}
			if (this.listeners[i]["down"]) {
				this.listeners[i]["down"] = this.listeners[i]["down"].filter(l => l !== listener);
			}
		}
	}

	clearListeners() {
		for (let i in this.listeners) {
			delete this.listeners[i];
		}
	}
}