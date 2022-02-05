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
		const keys = new Set();
		document.addEventListener("keydown", e => {
			if (!keys.has(e.key)) {
				keys.add(e.key);
				const listener = listeners[e.key] || listeners[null];
				this.executeAll(listener?.down, e);
			}
		});
		document.addEventListener("keyup", e => {
			keys.delete(e.key);
			const listener = listeners[e.key] || listeners[null];
			this.executeAll(listener?.up, e);
		});
		this.listeners = listeners;
		this.keys = keys;
	}

	executeAll(listeners, e) {
		if (listeners) {
			for (let f of listeners) {
				f(e);
			}
		}
	}

	addKeyListener(key, type, onKey) {
		if (Array.isArray(key)) {
			for (let k of key) {
				this.addKeyListener(k, type, onKey);	
			}
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