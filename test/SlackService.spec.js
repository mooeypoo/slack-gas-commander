import { expect } from "chai"
import SlackService from '../src/SlackService'

describe("SlackService test", () => {
	describe("translateKeyValues", () => {
		const cases = [
			{
				msg: 'Simple replacement',
				input: '%one% is %two%',
				values: {
					one: 'Foo',
					two: 'Bar'
				},
				expected: 'Foo is Bar'
			},
			{
				msg: 'Replacement with values not in string',
				input: '%one% is %two%',
				values: {
					one: 'Foo',
					two: 'Bar',
					three: 'Baz',
					four: 'Quuz'
				},
				expected: 'Foo is Bar'
			},
			{
				msg: 'Replacement missing values',
				input: '%one% is %two%',
				values: {
					one: 'Foo'
				},
				expected: 'Foo is '
			},
			{
				msg: 'Replacement has value appear twice',
				input: '%one% is %two% but also %one% is %three%',
				values: {
					one: 'Foo',
					two: 'Bar',
					three: 'Baz'
				},
				expected: 'Foo is Bar but also Foo is Baz'
			},
		];

		const slack = new SlackService();
		cases.forEach(c => {
			it(c.msg, () => {
				expect(slack.translateKeyValues(c.input, c.values)).to.equal(c.expected)
			})
		});
	});
});
