import SpreadsheetService from './SpreadsheetService'
import Command from './Command'
import GASError from './GASError'
import SlackService from './SlackService'

class SlackGasCommander {
	/**
	 * Instantiate based on a given definition setting up the behavior of
	 * the commands, the relationship to the spreadsheets, and the basic
	 * setup for Slack integration, like the unique tokens.
	 *
	 * @param {Object} definition Command and sheet relation definition
	 */
	constructor(definition = {}) {
		// Store sheets
		this.sheets = {};
		for (const [sId, sData] of Object.entries(definition.sheets || {})) {
			this.sheets[sId] = new SpreadsheetService(
				sData.url,
				sData.columns,
				sData.sheet || 0,
				sData.mockRows || [] // For testing purposes
			)
		}

		// Store commands
		this.commands = {};
		for (const [cmd, cmdData] of Object.entries(definition.commands || {})) {
			const sheet = this.sheet[cmdData.sheet];
			if (!sheet) {
				continue;
			}

			this.commands[cmd] = new Command(cmd, sheet, cmdData);
		}

		this.format = definition.format || {};
		this.slack = new SlackService(this.sheet, this.format);
	}

	process(parameters) {
		try {
			return this._doProcessing(parameters);
		} catch (e) {
			// TODO: Return a jsonified error message from GAS service
			// using ContentService.createTextOutput(JSON.stringify(output)).setMimeType(ContentService.MimeType.JSON);
			// TODO: Use a GoogleAppScript service for those?
			return null;
		}
	}


	// Private methods
	// TODO: Move these into another processing class that is actually private
	// so these methods aren't exposed to the consumer

	/**
	 * Process the post event given by the command, to the Google App Script endpoint.
	 *
	 * @param {Object} event Post event from Google App Script doPost(e)
	 */
	_doProcessing(parameters) {
		const command = parameters.command[0];

		if (!this.commands[command]) {
			throw new GASError('processing', `Given command "${cmd}" is not recognized.`)
		}
		if (!this.commands[command].getSheet()) {
			throw new GASError('processing', `Given command "${cmd}" does not have an attached spreadsheet.`)
		}
		if (!this.validateIncomingToken(command, parameters.token[0])) {
			throw new GASError('processing', 'Given token is invalid.');
		}
		const text = params.text && params.text[0] && params.text[0].trim();
		if (!text && !this.commands[command].isRandom()) {
			// Parameter is expected
			throw new GASError('command', 'Expecting a parameter.')
		}

		// Get the results
		const results = this.commands[command].trigger(text);
		let slackAnswer = Object.assign(
			{
				'response_type': 'in_channel'
			},
			this.slack.getResultOutput(text, results)
		);
		// Output for GAS
		return this.outputJSON(slackAnswer);
	}

	_trigger(cmd, text) {
		if (!this.commands[cmd]) {
			throw new GASError('command', `Given command "${cmd}" is not recognized.`)
		}
		return this.commands[cmd].trigger(text);
	}

	/**
	 * Validate that the incoming token is correct for the
	 * requested command.
	 *
	 * @param {String} command Given command
	 * @param {String} token Given token
	 */
	validateIncomingToken(command, token) {
		return this.commands[command] && this.commands[command].isTokenValid(token);
	}
	outputJSON(object) {
		return ContentService.createTextOutput(JSON.stringify(object)).setMimeType(ContentService.MimeType.JSON);
	}
}

export default SlackGasCommander;