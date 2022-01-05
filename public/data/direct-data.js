class DirectData {
	constructor(fileUtils) {
		this.fileUtils = fileUtils;
		this.dataStore = {};
		this.pendingSave = new Set();
	}

	async getData(path) {
		if (this.dataStore[path]) {
			return this.dataStore[path];
		}
		return (await this.fileUtils.load(`data/${path}`)) || Constants.EMPTY;
	}

	setData(path, data) {
		this.dataStore[path] = data;
		this.pendingSave.add(path);
	}

	async save() {
		for (let path of this.pendingSave) {

		}
	}
}