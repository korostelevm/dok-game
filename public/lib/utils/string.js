class StringUtil {
    static kebabToClass(input) {
        return input.replace(/-?\b([a-z])/g, function (g) {
            return g[g.length - 1].toUpperCase();
        });
    }	
}