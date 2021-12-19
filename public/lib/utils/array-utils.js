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

Array.prototype.cell = function(x, y) {
	return this[y] ? this[y][x] : null;
};

Array.prototype.setCell = function(x, y, value) {
	if (this[y]) {
		this[y][x] = value;
	}
}