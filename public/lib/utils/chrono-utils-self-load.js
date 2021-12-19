class ChronoUtils {
	static reset() {
		performance.clearMarks();
	}

	static tick(depth) {
		const line = new Error().stack.split("\n")[depth||2];
		performance.mark(
			!line || line.indexOf("at") < 0 ? ""
				: line.substr(line.indexOf("at") + 3).split(location.href).join(""));
	}

	static log() {
		const marks = performance.getEntriesByType("mark")
			.map(({name,startTime}, index, array) => [Math.round(startTime), "+"+Math.round(startTime - (array[index-1]?.startTime||0)), name]);
		console.info(marks);
		ChronoUtils.reset();
	}
}
ChronoUtils.tick();