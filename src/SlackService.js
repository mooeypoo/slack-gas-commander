import GASError from './GASError';

/**
 * Produce output for Slack API
 */
class SlackService {
	/**
	 * @param {string[]} columns An array defining the column names
	 * @param {Object} format Object that defines the formatting of outputted
	 *  messages. Must include these keys:
	 * - title: For the message title
	 * - result: For individual results
	 * - no_result: For when there are no results found
	 */
	constructor(columns, format = {}) {
		this.columns = columns;
		this.format = format;
	}

	/**
	 * Translate and replace the %key% representations in the
	 * strings into the equivalent values from the translation object.
	 *
	 * @param {string} str Format string
	 * @param {Object} values An object representing the key/value of
	 *  the replacement terms.
	 * @return {string} A complete translated string
	 */
	translateKeyValues(str, values) {
		// eslint-disable-next-line max-statements-per-line
		return str.replace(/%([^%\s]+)%/g, (match, symbol) => { return values[symbol] || ''; });
	}

	/**
	 * Get a title representation
	 *
	 * @param {string} lookupWord The term used for the request or lookup
	 * @return {string} A complete title
	 */
	getTitle(lookupWord) {
		return this.format.title ?
			this.translateKeyValues(this.format.title, { term: lookupWord }) :
			`Found results for "${lookupWord}"`;
	}

	/**
	 * Get the complete object representing Slack Blocks for the
	 * response, based on the lookup word and result rows.
	 *
	 * @param {string} lookupWord Original lookup word
	 * @param {Array[]} results An array of row objects
	 * @return {Object} Slack Blocks for the response
	 */
	getResultOutput(lookupWord, results) {
		if (!this.format.result) {
			throw new GASError('format', 'There is no valid response format provided.');
		}

		const attachments = [];

		if (!results.length) {
			attachments.push({
				mrkdwn_in: ['text'],
				color: '#36a64f', // TODO: Configurable
				pretext: '',
				title: this.format.no_result ?
					this.translateKeyValues(this.format.no_result, { term: lookupWord }) :
					`No results found for "${lookupWord}"`,
				text: ''
			});
		} else {
			attachments.push({
				mrkdwn_in: ['text'],
				color: '#36a64f', // TODO: Configurable
				pretext: '',
				title: this.getTitle(lookupWord),
				text: ''
			});
		}

		results.forEach(res => {
			attachments.push({
				mrkdwn_in: ['text'],
				// Add %term% as lookup word
				text: this.translateKeyValues(
					this.format.result, Object.assign(res, { term: lookupWord })
				)
			});
		});
		return { attachments };
	}
}

export default SlackService;
