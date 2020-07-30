class SlackService {
	static getResultOutput(title, results = [], link = '') {
		let attachments = [{
			'mrkdwn_in': ['text'],
			"color": "#36a64f",
			"pretext": "",
			// TODO: Make the title text configurable
			"title": `Results for ${title}`,
			text: ''
		}];
		if (
			!results ||
			(Array.isArray(results) && !results.length)
		) {
			// No results
			attachments.push({
				'mrkdwn_in': ['text'],
				// TODO: Make configurable
				text: 'No results found. ' + (link ? `<${link}|Add it?>` : '')
			})
		} else {
			// Result found
			results = Array.isArray(results) ? results : [results];
			results.forEach(res => {
				attachments.push({
					'mrkdwn_in': ['text'],
					text: res
				});
			})
		}

		return { attachments };
	}
}

export default SlackService;