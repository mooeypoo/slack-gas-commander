import { expect } from "chai"
import SlackGasCommander from '../src/SlackGasCommander'

/*
From Slack documentation, expected parameter structure
for slash-commands is:
https://api.slack.com/interactivity/slash-commands#app_command_handling

```
token=gIkuvaNzQIHg97ATvDxqgjtO
&team_id=T0001
&team_domain=example
&enterprise_id=E0001
&enterprise_name=Globular%20Construct%20Inc
&channel_id=C2147483705
&channel_name=test
&user_id=U2147483697
&user_name=Steve
&command=/weather
&text=94070
&response_url=https://hooks.slack.com/commands/1234/5678
&trigger_id=13345224609.738474920.8088930838d88f008e0
```

Slack-GAS-Commander only needs a few of these, but the tests
below can mock an incoming POST request from Slack and make
sure that the response is what we expect.
*/



describe("SlackGasCommander test", () => {
	describe('Basic command', () => {
		const definition = {
			sheets: {
				id_abbrev: {
					url: '', // Skipped; tests are given mock rows
					columns: [
						'col1',
						'col2',
						'col3'
					],
					sheet: 0,
					mockRows: [
						['row1col1', 'row1col2', 'row1col3'],
						['row2col1', 'row2col2', 'row2col3'],
						['row3col1', 'row3col2', 'row3col3'],
						['', '', '']
						['row4col1', 'row4col2', 'row4col3'],
						['row5col1', 'row5col2', 'row5col3'],
						['row6col1', 'row6col2', 'row6col3'],
						['row7col1', 'row6col2', 'row7col3'], // Duplicate col2 on purpose
						['', '', ''],
						['', '', '']
					]
				}
			},
			commands: {
				abbrev: { // Key is the command name in slack; /abbrev
					slack_token: 'xxxxx',
					sheet: 'id_abbrev',
					random: false,
					lookup_column: 'col1',
					format: {
						title: 'These are the results for %term%', // Only "%term% is valid here
						result: '*%term%* is %col3%',
						no_result: 'Couldn\'t find anything for "%term%"'
					}
				}
			}
		},
			cases = [
				{
					msg: 'Non random single result',
					incoming: {
						token: 'xxxxx', // correct token
						command: '/abbrev', // correct command
						text: 'ROW3COL1' // existing lookup value
					},
					expected: {
						attachments: [
							{
								color: "#36a64f",
								mrkdwn_in: [
									"text"
								],
								pretext: "",
								text: "",
								title: "These are the results for ROW3COL1",
							},
							{
								mrkdwn_in: [
									"text"
								],
								text: "*ROW3COL1* is row3col3" // case preserved from term
							}
						],
						response_type: "in_channel"
					}
				}
			];

		const sgc = new SlackGasCommander(definition);
		const baseParams = {
			// token: 'xxxx',
			team_id: 'T0001',
			team_domain: 'example',
			enterprise_id: 'E0001',
			enterprise_name: 'Foo bar Inc',
			channel_id: 'C2147483705',
			channel_name: 'test',
			user_id: 'U2147483697',
			user_name: 'mooeypoo',
			// command: '/abbrev',
			// text: '',
			response_url: 'https://hooks.slack.com/commands/1234/5678',
			trigger_id: '13345224609.738474920.8088930838d88f008e0'
		}

		cases.forEach(c => {
			it(c.msg, () => {
				expect(
					sgc.process(Object.assign({}, c.incoming, baseParams))
				).to.deep.equal(c.expected)
			})
		})
	})
});
