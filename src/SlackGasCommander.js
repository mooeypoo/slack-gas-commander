import SpreadsheetService from './SpreadsheetService'
import Command from './Command'

class SlackGasCommander {
	constructor(definition = {}) {
		// Store sheets
		this.sheets = {};
		for (const [sId, sData] of Object.entries(definition.sheets || {})) {
			this.sheets[sId] = new SpreadsheetService(
				sData.url,
				sData.columns,
				sData.sheet || 0
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
	}

	trigger(cmd, text) {
		if (!this.commands[cmd]) {
			throw new Error(`Given command "${cmd}" is not recognized.`)
		}
		return this.commands[cmd].trigger(text);
	}
}

export default SlackGasCommander;