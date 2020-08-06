/**
 *
 */
class Utils {
	/**
	 * Get a random item from within an array
	 *
	 * @param {Object[]|string[]|number[]} arr Given array
	 * @return {Object[]|string[]|number[]} Random item
	 */
	static getRandomArrayItem(arr) {
		return arr[Math.floor(Math.random() * arr.length)];
	}

}

export default Utils;
