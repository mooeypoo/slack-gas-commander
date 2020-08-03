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
			this.translateKeyValues(this.format.title, { title: lookupWord }) :
			`Found results for ${lookupWord}`;
	}

	getResultOutput(lookup = '', results = []) {
		if (!this.format.result) {
			throw new GASError('format', 'There is no valid response format provided.')
		}

		let attachments = [];
		if (!result.length) {
			attachments.push({
				'mrkdwn_in': ['text'],
				"color": "#36a64f", // TODO: Configurable
				"pretext": "",
				"title": this.format.no_result ?
					this.translateKeyValues(this.format.no_result, { title: lookupWord }) :
					`No results found for ${lookupWord}`,
				text: ''
			});
		} else {
			attachments.push({
				'mrkdwn_in': ['text'],
				"color": "#36a64f", // TODO: Configurable
				"pretext": "",
				"title": this.getTitle(lookup),
				text: ''
			});
		}

		results.forEach(res => {
			attachments.push({
				'mrkdwn_in': ['text'],
				text: this.translateKeyValues(this.format.result, res)
			});
		});
		return { attachments };
	}
}

export default SlackService;