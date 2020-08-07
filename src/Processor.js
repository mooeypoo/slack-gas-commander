import SpreadsheetService from './SpreadsheetService';
import Command from './Command';
import GASError from './GASError';
import SlackService from './SlackService';

/**
 * Process the event data given by Slack API.
 * This is the "engine" behind the SlackGasCommander class,
 * which is meant to only expose the public methods of processing.
 */
class Processor {
	/**
	 * Instantiate based on a given definition setting up the behavior of
	 * the commands, the relationship to the spreadsheets, and the basic
	 * setup for Slack integration, like the unique tokens.
	 *
	 * @param {Object} definition Command and sheet relation definition
	 */
	constructor(definition = {}) {
		this.validateDefinition(definition);
		// Store sheets
		this.sheets = {};
		for (const [sId, sData] of Object.entries(definition.sheets || {})) {
			this.sheets[sId] = new SpreadsheetService(
				sData.url,
				sData.columns,
				sData.sheet || 0,
				sData.mockRows || [] // For testing purposes
			);
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

			this.slack[cmd] = new SlackService(sheet.getColumns(), cmdData.format);
		}

	}

	/**
	 * Process the post event given by the command, to the Google App Script endpoint.
	 *
	 * @param {Object} parameters Event parameters, sent by Slack
	 * @return {Object} A response object for Slack.
	 */
	process(parameters) {
		// Remove the slash from incoming command name
		const command = (Array.isArray(parameters.command) ?
			parameters.command[0] : parameters.command).substr(1);
		const token = Array.isArray(parameters.token) ? parameters.token[0] : parameters.token;

		if (!this.commands[command]) {
			throw new GASError('processing', `Given command "${command}" is not recognized.`);
		}
		if (!this.commands[command].getSheet()) {
			throw new GASError('processing', `Given command "${command}" does not have an attached spreadsheet.`);
		}
		if (!this.validateIncomingToken(command, token)) {
			throw new GASError('processing', 'Given token is invalid.');
		}
		const text = (Array.isArray(parameters.text) ? parameters.text[0] : parameters.text).trim();

		if (!text && !this.commands[command].isRandom()) {
			// Parameter is expected
			throw new GASError('command', 'Expecting a parameter.');
		}

		// Get the results
		const results = this.commands[command].trigger(text);
		const slackAnswer = Object.assign(
			{
				// TODO: This should be configurable from the command definition
				response_type: 'in_channel'
			},
			this.slack[command].getResultOutput(text, results)
		);
		// Output for GAS
		return slackAnswer;
	}

	/**
	 * Validate that the incoming token is correct for the
	 * requested command.
	 *
	 * @param {string} command Given command
	 * @param {string} token Given token
	 * @return {boolean} Incoming token is valid
	 */
	validateIncomingToken(command, token) {
		return this.commands[command] && this.commands[command].isTokenValid(token);
	}

	/**
	 * Validate the structure and expected details of the definition
	 *
	 * @param {Object} definition Object defining the system
	 */
	validateDefinition(definition) {
		if (!definition) {
			throw new GASError('validation', 'Definition object cannot be empty.');
		}

		if (!definition.sheets || !Object.keys(definition.sheets).length) {
			throw new GASError('validation', 'Definition must include at least one sheet.');
		}

		if (!definition.commands || !Object.keys(definition.commands).length) {
			throw new GASError('validation', 'Definition must include at least one command.');
		}
	}
	/**
	 * Output an object into JSON representation using Google App Script's
	 * ContentService and headers.
	 *
	 * @param {Object} object to JSONify
	 * @return {ContentService} stringified representation within Google App Script
	 */
	outputJSON(object) {
		return ContentService.createTextOutput(JSON.stringify(object))
			.setMimeType(ContentService.MimeType.JSON);
	}
}

export default Processor;
