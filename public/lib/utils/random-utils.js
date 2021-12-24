let seed = 11111;

class RandomUtils {
	static random(i, salt) {
		return (((Math.sin(((i||seed++)*13053+123 + (salt||seed++)))*1000)%1) + 1) / 2;
	}	
}