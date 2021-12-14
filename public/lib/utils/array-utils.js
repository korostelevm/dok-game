class ArrayUtils {
	static sort(array, indexCallback) {
	}

	static shuffle(array) {
		for (let i = 0; i < array.length; i++) {
			const n = Math.floor(Math.random() * array.length);
		    [array[i], array[n]] = [array[n], array[i]];
		}
	}
}

Array.prototype.at = (x, y) {
	return this[y] ? this[y][x] : null;
};