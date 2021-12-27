class StringUtil {
    static kebabToClass(input) {
        return input.replace(/-?\b([a-z])/g, g => g[g.length - 1].toUpperCase());
    }	
}