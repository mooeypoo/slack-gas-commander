import { expect } from 'chai';
import SpreadsheetService from '../src/SpreadsheetService.js';
import Command from '../src/Command';

const columns = ['col1', 'col2', 'col3'],
	mockRows = [
		['row1col1', 'row1col2', 'row1col3'],
		['row2col1', 'row2col2', ''],
		['row3col1', 'row3col2', 'row3col3'],
		['', '', '']
		['row4col1', 'row4col2', 'row4col3'],
		['row5col1', 'row5col2', 'row5col3'],
		['row6col1', 'row6col2', 'row6col3'],
		['row7col1', 'row6col2', 'row7col3'], // Duplicate col2 on purpose
		['foo', 'row8col2', 'row8col3'], // Duplicate col1
		['foo', 'row9col2', 'row9col3'],
		['', '', '']
	],
	// For reference
	sheet = new SpreadsheetService('', columns, 0, mockRows);

describe('Command test', () => {
	describe('Instantiation', () => {
		const def = {
			slack_token: 'xyz',
			random: false,
			lookup_column: 'col1',
			case_sensitive: true
		},
			cmd = new Command('foo', sheet, def);

		it('isTokenValid', () => {
			expect(cmd.isTokenValid('xyz')).to.be.true;
		})
		it('isRandom', () => {
			expect(cmd.isRandom()).to.be.false;
		})
		it('getSheet', () => {
			expect(cmd.getSheet()).to.deep.equal(sheet);
		})
		it('getSheet', () => {
			expect(cmd.isCaseSensitive()).to.be.true;
		})
	});

	describe('trigger (non random: false)', () => {
		const cases = [
			{
				msg: 'Non random lookup/response cols',
				command: {
					cmd: 'foo',
					sheet: sheet,
					definition: {
						random: false,
						lookup_column: 'col1'
					}
				},
				tests: [
					{
						msg: 'No text given',
						text: '',
						expected: []
					},
					{
						msg: 'Text lookup exists',
						text: 'row3col1',
						expected: [
							{
								col1: 'row3col1',
								col2: 'row3col2',
								col3: 'row3col3'
							}
						]
					},
					{
						msg: 'Text lookup doesn\'t exist',
						text: 'foobar',
						expected: []
					},
					{
						msg: 'Response to lookup is an empty string',
						text: 'row2col1',
						expected: [
							{
								col1: 'row2col1',
								col2: 'row2col2',
								col3: ''
							}
						]
					},
					{
						msg: 'Response is multiple results',
						text: 'foo',
						expected: [
							{
								col1: 'foo',
								col2: 'row8col2',
								col3: 'row8col3'
							},
							{
								col1: 'foo',
								col2: 'row9col2',
								col3: 'row9col3'
							}
						]
					}
				]
			}
		];

		cases.forEach(c => {
			const cmd = new Command(c.command.cmd, c.command.sheet, c.command.definition);
			c.tests.forEach(t => {
				it(`${c.msg} - ${t.msg}`, () => {
					expect(cmd.trigger(t.text))
						.to.deep.equal(t.expected);
				});
			});
		});
	});

	describe('trigger (random: true)', () => {
		const cases = [
			{
				msg: 'Random lookup/response cols',
				command: {
					cmd: 'foo',
					sheet: sheet,
					definition: {
						random: true,
						lookup_column: '' // Doesn't matter; ignored on random
					}
				},
				tests: [
					// All below expect an answer that
					// exists in the column that is not empty
					{
						msg: 'No text given',
						text: ''
					},
					{
						msg: 'Text lookup exists',
						text: 'row3col1'
					},
					{
						msg: 'Text lookup doesn\'t exist',
						text: 'foobar'
					},
					{
						msg: 'Response to lookup is an empty string',
						text: 'row2col1'
					}
				]
			}
		];
		const potentialMembers = [
			{
				col1: 'row1col1',
				col2: 'row1col2',
				col3: 'row1col3'
			},
			{
				col1: 'row2col1',
				col2: 'row2col2',
				col3: ''
			},
			{
				col1: 'row3col1',
				col2: 'row3col2',
				col3: 'row3col3'
			},
			{
				col1: 'row4col1',
				col2: 'row4col2',
				col3: 'row4col3'
			},
			{
				col1: 'row5col1',
				col2: 'row5col2',
				col3: 'row5col3'
			},
			{
				col1: 'row6col1',
				col2: 'row6col2',
				col3: 'row6col3'
			},
			{
				col1: 'row7col1',
				col2: 'row6col2',
				col3: 'row7col3'
			},
			{
				col1: 'foo',
				col2: 'row8col2',
				col3: 'row8col3'
			},
			{
				col1: 'foo',
				col2: 'row9col2',
				col3: 'row9col3'
			}
		];

		cases.forEach(c => {
			const cmd = new Command(c.command.cmd, c.command.sheet, c.command.definition);
			c.tests.forEach(t => {
				it(`${c.msg} - ${t.msg}`, () => {
					expect(potentialMembers).to.include.deep.members(cmd.trigger(t.text));
				});
			});
		});
	});

	// TODO: Commands with parameters?
});
