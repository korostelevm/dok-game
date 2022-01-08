const SAVE_AFTER_MILLIS = 5000;

class DirectData {
	constructor(fileUtils) {
		this.fileUtils = fileUtils;
		this.dataStore = {};
		this.pendingSave = new Set();
	}

	async getData(path) {
		this.canWrite = JSON.parse(await this.fileUtils.load('data/can-write.json'));


		if (!this.dataStore[path]) {
			this.dataStore[path] = (await this.fileUtils.load(`data/${path}`)) || {};
		}
		return this.dataStore[path];
	}

	didChange(path) {
		if (!this.canWrite) {
			return;
		}
		clearTimeout(this.timeout);
		this.pendingSave.add(path);
		this.timeout = setTimeout(() => this.performSave(),
			SAVE_AFTER_MILLIS);
	}

	performSave() {
		if (!this.canWrite) {
			return;
		}
		this.save().then(response => {
			console.info(`Save performed. result: ${JSON.stringify(response)}}`);
		});
	}

	async save() {
		if (!this.canWrite) {
			return;
		}
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