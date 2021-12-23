class DragDrop extends UiComponent {
	constructor(engine) {
		super(engine);
	}

	async init() {			
		let dropArea = document.body;
		//  dropArea.addEventListener('dragenter', handlerFunction, false)
		//  dropArea.addEventListener('dragleave', handlerFunction, false)
		dropArea.addEventListener('dragover', this.handlerFunction, false);
		dropArea.addEventListener('drop', this.handlerFunction, false)

	}

	handlerFunction(e) {
		e.preventDefault();
		e.stopPropagation();
	}	
}
