[![CircleCI](https://circleci.com/gh/mooeypoo/slack-gas-commander.svg?style=svg)](https://circleci.com/gh/mooeypoo/slack-gas-commander) [![npm version](https://badge.fury.io/js/%40mooeypoo%2Fslack-gas-commander.svg)](https://badge.fury.io/js/%40mooeypoo%2Fslack-gas-commander) [![Coverage Status](https://coveralls.io/repos/github/mooeypoo/slack-gas-commander/badge.svg?branch=master)](https://coveralls.io/github/mooeypoo/slack-gas-commander?branch=master) ![NPM](https://img.shields.io/npm/l/@mooeypoo/slack-gas-commander?style=flat-square) [![License](https://img.shields.io/github/issues/mooeypoo/slack-gas-commander?style=flat-square)](https://github.com/mooeypoo/slack-gas-commander/issues) ![Twitter Follow](https://img.shields.io/twitter/follow/mooeypoo?style=flat-square)

Slack GAS Commander
======================

**This package is not yet ready for production.**

With Slack GAS Commander npm package you can simply and quickly set up a connection between Slack Commands and Google Spreadsheets through Google App Script (GAS) and a configuration object.

For example, if your spreadsheet includes the columns 'first name' and 'last name', your command can look something like this: `/lastname john` and get a result of all people whose first name matches "john" in the connected spreadsheet.

You can control the output format, what column is used for looking up results, whether the lookup is case sensitive or allow for random results using a configuration object.


## Getting Started

To use this package in your code, you first need to set up some pre requisites to allow you to connect Google Sheets to Slack.

### Prerequisites

#### Google App Script

1. Create a Google Sheet that will hold your data. If you want to work with more than one sheet, create those as well and retain each of their URLs.
2. Create a Google App Script (web app) to hold the script that communicates between the spreadsheet and Slack.
	* **NOTE:** If you want to work with multiple google spreadsheets, you don't have to make multiple App Scripts; one script is enough as long as you give your script the "spreadsheet" oauth scope (see below) and retain the spreadsheet URL.
	* Recommended: Use Google App Script CLI tool, [clasp](https://github.com/google/clasp).
	* Make sure the script is defined as a 'web app' and has public view permission. Here are recommended permissions in `appsscript.json`:
   ```json
	{
	"timeZone": "America/Los_Angeles",
	"dependencies": {
	},
	"webapp": {
		"access": "ANYONE_ANONYMOUS",
		"executeAs": "USER_DEPLOYING"
	},
	"exceptionLogging": "STACKDRIVER",
	"oauthScopes": ["https://www.googleapis.com/auth/spreadsheets"]
	}
	```
	* **NOTE:** You will need to make sure your web app has permissions for accessing the Google spreadsheet.
3. Publish your Google Script, and copy the published app URL.
   	* **NOTE:** Make sure you have the published app URL and not the development URL.
4. After the first time you have connected your spreadsheets through the code (or instantiated the system with a config that contains the spreadsheets URL) you will need to visit the Google App Script UI. A prompt will pop up to ask for permissions to access the spreadsheets for you to approve. This is only done once.

#### Slack integration (or app)

You will need to create a Slack command for your workspace. You can do that using Slack's custom integration, or by creating a standalone app. See Slack's documentation on either of those options.

Create your command, and complete the following steps:
1. In the "Integration settings" make sure the URL is set to your Google App script published url from step 3 above.
2. Copy the token to your records and retain it. You will need to provide this token for this command definition
3. Customize the rest of the details as you please.

#### Using npm packages in a Google App Script
Google App Script doesn't support npm modules out of the box, but you can use any packages alongside a build step, like `webpack` or `grunt`. There are multiple tutorials available for this online, like [this one](https://blog.gsmart.in/es6-and-npm-modules-in-google-apps-script/).

## Installation

To use the `slack-gas-commander` package, install it in your project:

```bash
npm install --save @mooeypoo/slack-gas-commander
```

1. Instantiate `SlackGasCommander` with a configuration describing the sheets and commands you need.
2. Call the instance from the web app's `doPost(e)` command, and pass the `e.parameters` that Slack sends to your app's URL.
3. You can then use Google App Script's `ContentService` to output the responses.

## Example

Assuming you use the method from [this tutorial](https://blog.gsmart.in/es6-and-npm-modules-in-google-apps-script/) to build your project, you will instantiate `SlackGasCommander` in the `lib.js` file:

```javascript
import SlackGasCommander from '@mooeypoo/slack-gas-commander'

const sgc = new SlackGasCommander({
	sheets: {
		id_sheet_1: {
			url: 'https://docs.google.com/spreadsheets/d/xxxx/edit#gid=0',
			columns: [
				'col1',
				'col2',
				'col3'
			],
			sheet: 0
		}
	},
	commands: {
		abbrev: { // Key is the command name in slack; /abbrev
			slack_token: 'yyyyyy',
			sheet: 'id_sheet_1', // Must reference a valid key in sheets object
			lookup_column: 'col1',
			format: {
				// Use the column names
				result: '%term% is %col2%',
				no_result: 'Not found. <https://docs.google.com/spreadsheets/d/xxxx/edit#gid=0|Add it?>'
			}
		}
	}
});

export { sgc };
```

And then call it from the `doPost(e)` method in your `Code.js` (or `api.js` if you followed the above tutorial)

```javascript
function doPost(e) {
	var response = AppLib.sgc.process(e.parameters);
	return ContentService.createTextOutput(JSON.stringify(response))
		.setMimeType(ContentService.MimeType.JSON);
}
```

Deploy your app and watch it work!

## Command and Sheet Definition
The definition object you instantiate the system with dictates the relationship between the spreadsheet and the commands used. You can use multiple spreadsheets and multiple commands in the same app:

- Specify the individual Slack tokens (per command) 
- Give all slack commands the same published google app script URL

The configuration object has two main sub-objects -- the sheets, and commands.

### sheets
Defines the spreadsheet or spreadsheets that your commands will use for data.

```json
{
	"sheets": {
		"unique_sheet_id": {
			"url": ,
			"columns": [ "col1", "col2", "col3" ],
			"sheet": 0
		}
	}
}
```

|   Property	|Type |   Description	|   Example |
|---	|---	|---	|---	|
|url   	|`string`|A URL to the spreadsheet |`"https://docs.google.com/spreadsheets/d/xxyyzz/edit#gid=0"`|
|  columns 	|`array`   	|An array of strings representing symbolic names for the columns in your spreadsheet.	| `['col1','col2','col3']`|
|<td colspan="4">NOTE: Column names are symbolic, and used for refreence for the command to know which column to read and output.</td>|
|<td colspan="4">You should avoid using spaces in column names. **You cannot name a colum `term`**</td>|
|sheet 	| `number`  |Sheet number, in case the spreadsheet has multiple sheets. Defaults to 0, which is the first sheet.| `0` |

### commands
Defines the behavior of the command and its output.

```json
{
	"commands": {
		"cmdName": {
			"slack_token": "xxxxx",
			"sheet": "unique_sheet_id",
			"lookup_column": "col1",
			"format": {
				"result": "%term% is %col3%",
				"no_result": "Not found"
			}
		}
	}
}
```
|   Property	|Type |   Description	|   Example |
|---	|---	|---	|---	|
|slack_token   	|`string`|Token given by slack for this command. Note, this is unique for each command.|`"abcdefghi"`
|sheet 	|`string`|The unique ID for the sheet this command will use for data.|`"unique_sheet_id"`
|lookup_column	|`string`|The symbolic name of the column that will be used for looking up matching values for the command.|`"col1"`
|format|`Object`|An object defining the output formats for `title`, `result` and `no_result`.|
|<td colspan="4">NOTE: All format strings accept column variables surrounded by `%`, as well as the generic `%term%` variable, representing the original term used for the lookup.</td>
|format.title|`string`|Defines the format of the response title. |`"Here are results for %term%"`
|format.result|`string`|Defines the format of each result. The results shown are defined by the column(s) names.|`"%term% means %col3% and %col2%"`
|format.no_result|`string`|Defines the format for the response when there are no results.|`"Couldn't find results for %term%, sorry!"`
## Contribute

Pull requests and feature requests welcome! Please report bugs or request features through [the repo issues](https://github.com/mooeypoo/slack-gas-commander/issues).

To contribute to the code with a pull request:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b adding-some-feature`)
3. Commit your Changes (`git commit -m 'Add some cool feature'`) Please make sure to include the reasoning for the fix, what bug it corrects, or the full details of the new feature being added.
4. Push to the Branch (`git push origin adding-some-feature`)
5. Open a Pull Request


<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.



<!-- CONTACT -->
## Contact

Moriel Schottlender [@mooeypoo](https://twitter.com/mooeypoo)

Project Link: [https://github.com/mooeypoo/slack-gas-commander](https://github.com/mooeypoo/slack-gas-commander)

## Acknowledgements

* README inspired by [othneildrew's Best-README-Template](https://github.com/othneildrew/Best-README-Template/blob/master/BLANK_README.md#getting-started) and [ddbeck's readme-checklist](https://github.com/ddbeck/readme-checklist/blob/main/checklist.md)
