class Command {
	constructor(trigger, sheet, definition) {
		this.triggerName = trigger;
		this.sheet = sheet;
		this.random = !!definition.random;
		this.lookup_column = definition.lookup_column;
		this.response_column = definition.response_column;
	}

	trigger(text) {
		if (this.random) {
			// Ignore the lookup; directly give the random from response_column
			return this.sheet.getRandomValue(this.response_column);
		}
		if (this.lookup_column) {
			return this.sheet.lookupValuesByColumn(this.lookup_column, text, this.response_column);
		}
		return '';
	}
}

export default Command;
