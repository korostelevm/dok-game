/**
	Dok-gamelib engine
	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
	FocusFixer
  */

class FocusFixer {
	constructor(canvas) {
		this.canvas = canvas;
		this.input = document.createElement("input");
		this.input.style.color = "transparent";
		this.input.style.textShadow = "0 0 0 black";
		this.input.style.backgroundColor = "transparent";
		this.input.style.border = "0px";
		this.input.style.outline = "none";
		this.input.style.position = "absolute";
		this.input.style.top = "-30px";
		this.gainFocusCallback = () => this.gainFocus();
		this.lostFocusCallback = () => this.lostFocus();
		this.fix();
	}

	fix() {
		const { input } = this;
		input.setAttribute("contenteditable", "");
		input.setAttribute("readonly", "");
		input.classList.add("focus-fixer-input");

		document.body.appendChild(input);
		this.gainFocus();

	}

	lostFocus() {
		if (this.focused) {
			this.focused = false;
			window.removeEventListener("blur", this.lostFocusCallback);
			window.addEventListener("focus", this.gainFocusCallback);
			document.addEventListener("mouseenter", this.gainFocusCallback);
		}
	}

	gainFocus() {
		if (!this.focused) {
			this.input.focus();
			this.focused = true;
			window.addEventListener("blur", this.lostFocusCallback);
			window.removeEventListener("focus", this.gainFocusCallback);
			document.removeEventListener("mouseenter", this.gainFocusCallback);
		}
	}
}