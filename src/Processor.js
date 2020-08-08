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
		for (const [sId, sData] of Object.entries(definition.sheets)) {
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
		for (const [cmd, cmdData] of Object.entries(definition.commands)) {
			const sheet = this.sheets[cmdData.sheet];
			if (!sheet) {
				throw new GASError('initialization', `Given command "${cmd}" references a sheet that is not recognized.`);
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
		const command = this.constructor.normalizeParameterValue(parameters.command);
		const token = this.constructor.normalizeParameterValue(parameters.token);

		if (!this.commands[command]) {
			throw new GASError('processing', `Given command "${command}" is not recognized.`);
		}
		if (!this.validateIncomingToken(command, token)) {
			throw new GASError('processing', 'Given token is invalid.');
		}
		const text = this.constructor.normalizeParameterValue(parameters.text);

		if (!text && !this.commands[command].isRandom()) {
			// Parameter is expected
			throw new GASError('processing', `Expecting a parameter for command "${command}".`);
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
		if (!definition || !Object.keys(definition).length) {
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
	 * Slack parameters seem to sometimes appear as part of an array, and
	 * sometimes not. Some of them have a slash and some not; this will
	 * normalize the response to output the expected parameter value.
	 *
	 * @param {string} rawParam Parameter value from the API
	 * @return {string} Normalized parameter value
	 */
	static normalizeParameterValue(rawParam) {
		let val = Array.isArray(rawParam) ? rawParam[0] : rawParam;

		val = val.trim();

		if (val.indexOf('/') === 0) {
			val = val.substr(1);
		}
		return val;
	}

	/**
	 * Output an object into JSON representation using Google App Script's
	 * ContentService and headers.
	 *
	 * @param {Object} object to JSONify
	 * @return {ContentService} stringified representation within Google App Script
	 */
	static outputJSON(object) {
		/* istanbul ignore next */
		return ContentService.createTextOutput(JSON.stringify(object))
			.setMimeType(ContentService.MimeType.JSON);
	}
}

export default Processor;
