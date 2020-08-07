import Processor from './Processor';

/**
 * The wrapper class, responsible for processing the event
 * parameters sent from the Slack API for the command, and returning
 * a JSON answer to be displayed in the Google App Script web interface.
 *
 * This class is the only one exposed to users of the library.
 *
 * @class SlackGasCommander
 */
class SlackGasCommander {
	/**
	 * Instantiate based on a given definition setting up the behavior of
	 * the commands, the relationship to the spreadsheets, and the basic
	 * setup for Slack integration, like the unique tokens.
	 *
	 * @param {Object} definition Command and sheet relation definition
	 */
	constructor(definition = {}) {
		this.processor = new Processor(definition);
	}

	/**
	 * Process the POST event given by Google App Script when Slack API sends
	 * parameters related to the command.
	 *
	 * @param {Object} parameters Event parameters, sent by Slack
	 * @return {Object} A response object for Slack.
	 */
	process(parameters) {
		// TODO: use try/catch to return a jsonified
		// error message from GAS service
		try {
			return this.processor.process(parameters);
		} catch (err) {
			// TODO: Output slack blocks with the error type and message
		}
	}
}

export default SlackGasCommander;
