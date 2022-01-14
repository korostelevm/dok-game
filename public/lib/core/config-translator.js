class ConfigTranslator {
	constructor(engine) {
		this.engine = engine;
	}

	async process(data, game) {
		return this.translate(await this.applyTemplates(data, game.path), game);
	}

	merge(data, newData) {
		if (!newData || typeof(newData) !== "object") {
			return newData;
		}
		if (!data) {
			data = Array.isArray(newData) ? [] : {};
		}
		for (let a in newData) {
			const obj = newData[a];
			data[a] = this.merge(data[a], obj);
		}
		return data;
	}

	fixPath(path, gamePath) {
		if (path.startsWith("/")) {
			return path;
		}
		const gameDir = gamePath.split("/").slice(0, -1).join("/");
		return `${gameDir}/${path}`;
	}

	async applyTemplates(data, gamePath) {
		if (!data || typeof(data) !== "object" || Array.isArray(data)) {
			return data;
		}
		const translatedData = {};
		if (data.templates || data.template) {
			const allTemplates = (data.templates||[]).concat(data.template ? [data.template] : []);
			const templateObjects = await Promise.all(allTemplates.map(path => this.engine.fileUtils.load(`${this.fixPath(path, gamePath)}.json`)));
			templateObjects.forEach(template => {
				this.merge(translatedData, template);
			});
		}
		this.merge(translatedData, data);

		for (let a in translatedData) {
			translatedData[a] = await this.applyTemplates(translatedData[a], gamePath);
		}

		return translatedData;
	}

	async translate(data, game, index) {
		if (!data) {
			return data;
		} else if (Array.isArray(data)) {
			return Promise.all(data.map(d => this.translate(d, game)));
		} else if (typeof(data) === "object") {
			if (data.IGNORE) {
				return null;
			}
			if (data.repeat && (typeof index === "undefined")) {
				return Promise.all(
					new Array(data.repeat).fill(null)
					.map((_, index) => this.translate(data, game, index)));
			}
			const translatedData = {};

			for (let a in data) {
				if (a !== "templates" && a !== "template") {
					translatedData[a] = await this.translate(data[a], game);
				}
			}
			return translatedData;
		}

		if (typeof(data)==="string") {
			const group = data.match(/^{([^}]+)}$/);
			if (group) {
				const settings = await game.getSettings(this.engine);
				const value = math.evaluate(group[1], {
					viewportWidth: settings.viewportSize[0],
					viewportHeight: settings.viewportSize[1],
					hotspot_center: Constants.HOTSPOT_CENTER,
					hotspot_bottom: Constants.HOTSPOT_BOTTOM,
					horizontal_merge: Constants.HORIZONTAL_MERGE,
					vertical_merge: Constants.VERTICAL_MERGE,
					full_merge: Constants.FULL_MERGE,
					debug: this.engine.debug ? 1 : 0,
					index,
					random: Math.random(),
				});
				return value;
			}
		}
		return data;
	}
}