import SpreadsheetService from './SpreadsheetService';

/**
 * Define a command that requests information from a spreadsheet
 */
class Command {
	/**
	 * @param {string} trigger Command trigger
	 * @param {SpreadsheetService} sheet Spreadsheet for this command
	 * @param {Object} definition A definition object containing information
	 *  for the functionality of the command
	 */
	constructor(trigger, sheet, definition) {
		this.triggerName = trigger;
		this.sheet = sheet;
		this.random = !!definition.random;
		this.lookup_column = definition.lookup_column;
		this.slackToken = definition.slack_token;
		this.caseSensitive = definition.case_sensitive !== undefined ?
			!!definition.case_sensitive : false;
	}

	/**
	 * Trigger the command with the given text parameters
	 *
	 * @param {string} [text] Parameters for the command
	 * @return {Array[]} An array of rows that contains arrays of columns
	 *  represnting the results of the triggered command
	 */
	trigger(text) {
		return this.sheet.getResultObjectByColumn(
			this.lookup_column, text, this.random, this.caseSensitive
		);
	}

	/**
	 * Check whether the incoming token is valid.
	 *
	 * @param {string} incomingToken Incoming token to compare
	 * @return {boolean} Token is valid
	 */
	isTokenValid(incomingToken) {
		return this.slackToken === incomingToken;
	}

	/**
	 * Check whether this command is random
	 *
	 * @return {boolean} Command is random
	 */
	isRandom() {
		return this.random;
	}

	/**
	 * Check whether this command relies on case sensitivity when requesting lookup
	 *
	 * @return {boolean} Command lookup is case sensitive
	 */
	isCaseSensitive() {
		return this.caseSensitive;
	}

	/**
	 * Get the SpreadsheetService that is connected to this command
	 *
	 * @return {SpreadsheetService} SpreadsheetService connected to this command
	 */
	getSheet() {
		return this.sheet;
	}
}

export default Command;
