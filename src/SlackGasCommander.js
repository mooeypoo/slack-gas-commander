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
		this.slack = {};
		for (const [cmd, cmdData] of Object.entries(definition.commands || {})) {
			const sheet = this.sheets[cmdData.sheet];
			if (!sheet) {
				continue;
			}

			this.commands[cmd] = new Command(cmd, sheet, cmdData);

			this.slack[cmd] = new SlackService(sheet, cmdData.format);
		}

	}

	process(parameters) {
		// TODO: use try/catch to return a jsonified error message from GAS service
		// using ContentService.createTextOutput(JSON.stringify(output)).setMimeType(ContentService.MimeType.JSON);
		// TODO: Use a GoogleAppScript service for those?
		return this._doProcessing(parameters);
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
		// Remove the slash from incoming command name
		const command = (Array.isArray(parameters.command) ? parameters.command[0] : parameters.command).substr(1);
		const token = Array.isArray(parameters.token) ? parameters.token[0] : parameters.token;

		if (!this.commands[command]) {
			throw new GASError('processing', `Given command "${command}" is not recognized.`)
		}
		if (!this.commands[command].getSheet()) {
			throw new GASError('processing', `Given command "${command}" does not have an attached spreadsheet.`)
		}
		if (!this.validateIncomingToken(command, token)) {
			throw new GASError('processing', 'Given token is invalid.');
		}
		const text = (Array.isArray(parameters.text) ? parameters.text[0] : parameters.text).trim();

		if (!text && !this.commands[command].isRandom()) {
			// Parameter is expected
			throw new GASError('command', 'Expecting a parameter.')
		}

		// Get the results
		const results = this.commands[command].trigger(text);
		let slackAnswer = Object.assign(
			{
				// TODO: This should be configurable from the command definition
				'response_type': 'in_channel'
			},
			this.slack[command].getResultOutput(text, results)
		);
		// Output for GAS
		return slackAnswer;
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