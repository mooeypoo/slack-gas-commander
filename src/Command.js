class Command {
	constructor(trigger, sheet, definition) {
		this.triggerName = trigger;
		this.sheet = sheet;
		this.random = !!definition.random;
		this.lookup_column = definition.lookup_column;
		this.slackToken = definition.slack_token;
	}

	trigger(text) {
		return this.sheet.getResultObjectByColumn(this.lookup_column, text, this.random);
	}

	isTokenValid(incomingToken) {
		return this.slackToken === incomingToken;
	}

	getSheet() {
		return this.sheet;
	}

}

export default Command;
