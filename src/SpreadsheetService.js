import Utils from './Utils'
import GASError from './GASError'
/**
 * Responsible for the direct connection to the Google Spreadsheet
 * Retrieves raw data of the rows for processing.
 */
class SpreadsheetService {
	constructor(url, columns = [], sheetNum = 0, mockValues = []) {
		const values = mockValues;

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
	}

	/**
	 * Return the row array
	 *
	 * @returns Array An array of rows, each an array of columns, in order.
	 */
	getRows() {
		return this.rows;
	}

	getColumns() {
		return this.columns;
	}

	getColumnIndex(colName) {
		return this.columns.indexOf(colName);
	}

	getRowsByColumn(column, lookupValue, caseSensitive = false) {
		let colIndex = this.columns.indexOf(column);
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
	 * @param {Boolean} [random] Return a random row
	 * @param {Boolean} [caseSensitive] Treat the lookup as case sensitive.
	 */
	getResultObjectByColumn(lookupColumn, lookupValue, random = false, caseSensitive = false) {
		let results = [];
		if (random) {
			// Random
			results = [this.getRandomRow()];
		} else {
			// Non-random, with a lookup value
			results = this.getRowsByColumn(lookupColumn, lookupValue);
		}
		return results.map(row => {
			let obj = {};
			for (let i = 0; i < this.columns.length; i++) {
				obj[this.columns[i]] = row[i]
			}
			return obj;
		});
	}

	getRandomRow() {
		return Utils.getRandomArrayItem(this.rows)
	}
	getRandomValue(fromCol) {
		let row, val,
			counter = 0,
			limit = this.rows.length / 50,
			fromColIndex = this.columns.indexOf(fromCol);
		do {
			// Look up non-empty value until found
			// or until we tried enough (50% of the rows)
			row = this.getRandomRow();
			val = row[fromColIndex];
			counter++
		} while (!val && counter < limit)

		return val || null;
	}

	static removeEmptyRows(rowArr = []) {
		return rowArr.filter(row => {
			return row && !row.every((col) => {
				return !col.length; // All columns are empty
			});
		});
	}
}

export default SpreadsheetService;
