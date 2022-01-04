class ConfigTranslator {
	constructor(engine) {
		this.engine = engine;
	}

	async process(data, game) {
		return this.translate(await this.applyTemplates(data), game);
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

	async applyTemplates(data) {
		if (!data) {
			return data;
		}
		const translatedData = {};
		if (data.templates) {
			const templates = await Promise.all(data.templates.map(path => this.engine.fileUtils.load(`templates/${path}.json`)));
			templates.forEach(template => {
				this.merge(translatedData, template);
			});
		}
		this.merge(translatedData, data);
		return translatedData;
	}

	async translate(data, game) {
		if (!data) {
			return data;
		} else if (Array.isArray(data)) {
			return Promise.all(data.map(d => this.translate(d, game)));
		} else if (typeof(data) === "object") {
			if (data.IGNORE) {
				return null;
			}
			const translatedData = {};

			for (let a in data) {
				if (a !== "templates") {
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
				});
				return value;
			}
		}
		return data;
	}
}