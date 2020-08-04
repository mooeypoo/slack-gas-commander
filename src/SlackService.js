import GASError from './GASError';

class SlackService {
	constructor(sheet, format = {}) {
		this.columns = sheet && sheet.getColumns();
		this.format = format;
	}

	translateKeyValues(str, values = {}) {
		return str.replace(/%([^%\s]+)%/g, function (match, symbol) { return values[symbol] || ''; });
	}

	getTitle(lookupWord) {
		return this.format.title ?
			this.translateKeyValues(this.format.title, { term: lookupWord }) :
			`Found results for ${lookupWord}`;
	}

	getResultOutput(lookupWord = '', results = []) {
		if (!this.format.result) {
			throw new GASError('format', 'There is no valid response format provided.')
		}

		let attachments = [];

		if (!results.length) {
			attachments.push({
				'mrkdwn_in': ['text'],
				"color": "#36a64f", // TODO: Configurable
				"pretext": "",
				"title": this.format.no_result ?
					this.translateKeyValues(this.format.no_result, { term: lookupWord }) :
					`No results found for ${lookupWord}`,
				text: ''
			});
		} else {
			attachments.push({
				'mrkdwn_in': ['text'],
				"color": "#36a64f", // TODO: Configurable
				"pretext": "",
				"title": this.getTitle(lookupWord),
				text: ''
			});
		}

		results.forEach(res => {
			attachments.push({
				'mrkdwn_in': ['text'],
				// Add %term% as lookup word
				text: this.translateKeyValues(this.format.result, Object.assign(res, { term: lookupWord }))
			});
		});
		return { attachments };
	}
}

export default SlackService;