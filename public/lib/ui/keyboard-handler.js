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
			keys[e.key] = true;
			const listener = listeners[e.key];
			if (listener && listener["down"]) {
				listener["down"](e);
			}
		});
		document.addEventListener("keyup", e => {
			this.keys[e.key] = false;
			const listener = listeners[e.key];
			if (listener && listener["up"]) {
				listener["up"](e);
			}
		});
		this.listeners = listeners;
		this.keys = keys;
	}

	addKeyListener(key, type, onKey) {
		this.listeners[key] = (this.listeners[key] || {});
		this.listeners[key][type] = onKey;
	}

	addKeyDownListener(key, onKey) {
		this.addKeyListener(key, "down", onKey);
	}

	addKeyUpListener(key, onKey) {
		this.addKeyListener(key, "up", onKey);
	}
}