/**
 * Error class for GAS errors
 */
class GASError extends Error {
	/**
	 * Produce an error with a certain type.
	 *
	 * @param {string} type Error type
	 * @param {string} message Error message
	 */
	constructor(type, message) {
		super(message);

		this.name = this.constructor.name;

		Error.captureStackTrace(this, this.constructor);

		this.type = type;
	}

	/**
	 * @return {string} Error type
	 */
	getType() {
		return this.type;
	}
}

export default GASError;
