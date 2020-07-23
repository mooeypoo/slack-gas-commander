import Utils from './Utils'
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

	getColumnIndex(colName) {
		return this.columns.indexOf(colName);
	}

	getRowsByColumn(column, lookupValue) {
		let colIndex = this.columns.indexOf(column);
		if (colIndex === -1) {
			throw new Error('Given column "' + column + '" does not exist in the spreadsheet definition.');
		}
		return this.rows.filter(row => {
			return row[colIndex] === lookupValue;
		});
	}

	lookupValuesByColumn(lookupColumn, lookupValue, responseColumn) {
		let responseColIndex = this.columns.indexOf(responseColumn);
		let rows = this.getRowsByColumn(lookupColumn, lookupValue);

		rows = rows.map(row => {
			return row[responseColIndex]
		})

		if (rows.length === 0) {
			return null;
		} else if (rows.length === 1) {
			return rows[0];
		}
		return rows;
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
