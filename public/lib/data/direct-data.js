const SAVE_AFTER_MILLIS = 5000;

class DirectData {
	constructor(fileUtils) {
		this.fileUtils = fileUtils;
		this.dataStore = {};
		this.pendingSave = new Set();
	}

	async getData(path) {
		if (!this.dataStore[path]) {
			this.dataStore[path] = (await this.fileUtils.load(`data/${path}`)) || {};
		}
		return this.dataStore[path];
	}

	didChange(path) {
		clearTimeout(this.timeout);
		this.pendingSave.add(path);
		this.timeout = setTimeout(() => this.performSave(),
			SAVE_AFTER_MILLIS);
	}

	performSave() {
		this.save().then(response => {
			console.info(`Save performed. result: ${JSON.stringify(response)}}`);
		});
	}

	async save() {
		const body = {};
		for (let path of this.pendingSave) {
			const data = this.dataStore[path];
			body[path] = data;
		}

		const response = await fetch("/data", {
		    method: 'POST',
		    cache: 'no-cache',
		    headers: {
		      'Content-Type': 'application/json',
		    },
		    body: JSON.stringify(body),
		});	
		return response;	
	}
}