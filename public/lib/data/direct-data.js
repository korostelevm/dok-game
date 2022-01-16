const SAVE_AFTER_MILLIS = 5000;

class DirectData {
	constructor(fileUtils, dataWriter, dataEndPoint) {
		this.fileUtils = fileUtils;
		this.dataStore = {};
		this.pendingSave = new Set();
		this.dataEndPoint = dataEndPoint || "/data";
		this.dataWriter = dataWriter || new DataWriter(this.dataEndPoint);
	}

	async getData(path) {
		if (!this.dataStore[path]) {
			this.dataStore[path] = {};
			try {
				this.dataStore[path] = (await this.fileUtils.load(`${this.dataEndPoint}/${path}`)) || {};
			} catch (e) {
				console.warn("Path: " + path + " unavailable.")
			}
		}
		return this.dataStore[path];
	}

	didChange(path) {
		clearTimeout(this.timeout);
		this.pendingSave.add(path);
		this.timeout = setTimeout(() => this.performSave(),
			SAVE_AFTER_MILLIS);
	}

	async performSave() {
		const canWrite = JSON.parse(await this.fileUtils.load(`${this.dataEndPoint}/can-write.json`));

		if (!canWrite) {
			return;
		}
		this.save().then(response => {
			console.info(`Save performed. response: ${response}`);
		});
	}

	async save() {
		const body = {};
		for (let path of this.pendingSave) {
			const data = this.dataStore[path];
			body[path] = data;
		}

		return Object.keys(body).length ? this.dataWriter.write(body) : null;
	}
}