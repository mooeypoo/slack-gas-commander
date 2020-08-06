class Command {
	constructor(trigger, sheet, definition) {
		this.triggerName = trigger;
		this.sheet = sheet;
		this.random = !!definition.random;
		this.lookup_column = definition.lookup_column;
		this.slackToken = definition.slack_token;
		this.caseSensitive = definition.caseSensitive !== undefined ? !!definition.caseSensitive : false;
	}

	trigger(text) {
		return this.sheet.getResultObjectByColumn(this.lookup_column, text, this.random, this.caseSensitive);
	}

	isTokenValid(incomingToken) {
		return this.slackToken === incomingToken;
	}

	getSheet() {
		return this.sheet;
	}

}

export default Command;
