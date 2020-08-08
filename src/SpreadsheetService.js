import Utils from './Utils';
import GASError from './GASError';
/**
 * Responsible for the direct connection to the Google Spreadsheet
 * Retrieves raw data of the rows for processing.
 */
class SpreadsheetService {
	/**
	 * @param {string} url URL for the spreadsheet
	 * @param {string[]} columns An array representing the names of the columns,
	 *  in order.
	 * @param {number} [sheetNum=0] The number representing the sheet in
	 *  the spreadsheet. Defaults to the first sheet.
	 * @param {Array[]} [mockValues] Optional mock rows for the spreadsheet.
	 *  Used primarily for testing.
	 */
	constructor(url, columns, sheetNum = 0, mockValues = []) {
		let values = mockValues;

		/* istanbul ignore next */
		if (typeof SpreadsheetApp !== 'undefined') {
			// If SpreadsheetApp exists, we're in Google App Script production
			const SheetApp = SpreadsheetApp.openByUrl(url),
				sheet = SheetApp.getSheets()[sheetNum],
				lastRow = sheet.getLastRow(),
				lastColumn = sheet.getLastColumn(),
				// Get the entire data rows and columns
				rangeObject = sheet.getRange('A2:' + lastRow + lastColumn);

			values = rangeObject.getValues();
		}

		// Filter empties; unfortunately, it looks like 'last row' is way below
		// what it should be
		this.rows = this.constructor.removeEmptyRows(values);
		this.columns = columns || [];
		this.url = url;
	}

	/**
	 * Return the column names
	 *
	 * @return {string[]} Array of column names, in order
	 */
	getColumns() {
		return this.columns;
	}

	/**
	 * Return the spreadsheet URL
	 *
	 * @return {string} Spreadsheet URL
	 */
	getUrl() {
		return this.url;
	}
	/**
	 * Get the index of the column, based on its name
	 *
	 * @param {string} colName Column name
	 * @return {number} Column index
	 */
	getColumnIndex(colName) {
		return this.columns.indexOf(colName);
	}

	/**
	 * Get all rows that match the lookup word within the requested
	 * column.
	 *
	 * @param {string} column Column name
	 * @param {string} lookupValue Value to look up
	 * @param {boolean} [caseSensitive] Whether the lookup should be
	 *  case sensitive.
	 * @return {Array[]} An array of rows matching the lookup
	 */
	getRowsByColumn(column, lookupValue, caseSensitive = false) {
		const colIndex = this.columns.indexOf(column);
		if (colIndex === -1) {
			throw new GASError('spreadsheet', 'Given column "' + column + '" does not exist in the spreadsheet definition.');
		}
		return this.rows.filter(row => {
			if (caseSensitive) {
				return row[colIndex] === lookupValue;
			} else {
				return row[colIndex].toLowerCase() === lookupValue.toLowerCase();
			}
		});
	}

	/**
	 * Get an object (or an array of objects) representing the valid
	 * result or results from the spreadsheet. The objects represent
	 * rows, where the keys are the column names as defined,
	 * and the values are the values of each colunm.
	 *
	 * @param {string} lookupColumn The column to compare the value
	 *  to so we match the correct row
	 * @param {string} lookupValue The value to compare to for matches.
	 *  If random, the lookup value is ignored, and a single random
	 *  row is returned.
	 * @param {boolean} [random] Return a random row
	 * @param {boolean} [caseSensitive] Treat the lookup as case sensitive.
	 * @return {Object[]} An array of objects representing the results of the rows
	 *  based on the lookup done. The objects are outputted as the name of columns
	 *  for keys, and values as values from the row.
	 */
	getResultObjectByColumn(lookupColumn, lookupValue, random = false, caseSensitive = false) {
		let results = [];
		if (random) {
			// Random
			results = [this.getRandomRow()];
		} else {
			// Non-random, with a lookup value
			results = this.getRowsByColumn(lookupColumn, lookupValue, caseSensitive);
		}
		return results.map(row => {
			const obj = {};
			for (let i = 0; i < this.columns.length; i++) {
				obj[this.columns[i]] = row[i];
			}
			return obj;
		});
	}

	/**
	 * Get a random row
	 *
	 * @return {Array[]} A random row
	 */
	getRandomRow() {
		return Utils.getRandomArrayItem(this.rows);
	}

	/**
	 * Remove empty rows from the stored row represntation.
	 * Only remove rows that have all columns empty.
	 *
	 * @param {Array[]} rowArr Array of rows
	 * @return {Array[]} Trimmed array of rows
	 */
	static removeEmptyRows(rowArr) {
		return rowArr.filter(row => {
			return row && !row.every(col => {
				return !col.length; // All columns are empty
			});
		});
	}
}

export default SpreadsheetService;
