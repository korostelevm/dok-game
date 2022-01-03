class StringUtil {
    static kebabToClass(input) {
        return input.replace(/-?\b([a-z0-9])/g, g => g[g.length - 1].toUpperCase());
    }	
}