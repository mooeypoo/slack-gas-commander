class GASError extends Error {
	constructor(type, message) {
		super(message);

		this.name = this.constructor.name

		Error.captureStackTrace(this, this.constructor);

		this.type = type;
	}

	getType() {
		return this.type;
	}
}

export default GASError;