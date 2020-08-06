import { expect } from 'chai';
import SpreadsheetService from '../src/SpreadsheetService.js';

const columns = ['col1', 'col2', 'col3'],
	mockRows = [
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
	];

describe( 'SpreadsheetService test', () => {
	describe( 'removeEmptyRows', () => {
		it( 'Should remove empty rows.', () => {
			const cases = [
				{
					input: [
						['something', 'another', 'thing'],
						['', '', ''],
						['something', '', 'half empty'],
						['', '', ''],
						['', '', ''],
						['', '', ''],
						['', '', 'one thing in'],
						['', '', ''],
						['', '', ''],
						['', '', '']
					],
					expected: [
						['something', 'another', 'thing'],
						['something', '', 'half empty'],
						['', '', 'one thing in']
					]
				}
			];

			cases.forEach( c => {
				expect( SpreadsheetService.removeEmptyRows( c.input ) )
					.to.deep.equal( c.expected );
			} );
		} );
	} );

	describe( 'getRowsByColumn', () => {
		const cases = [
			{
				msg: 'Simple result lookup',
				input: {
					col: 'col2',
					val: 'row5col2'
				},
				expected: [
					['row5col1', 'row5col2', 'row5col3']
				]
			},
			{
				msg: 'No result found',
				input: {
					col: 'col3',
					val: 'foobar'
				},
				expected: []
			},
			{
				msg: 'Multiple results found',
				input: {
					col: 'col2',
					val: 'row6col2'
				},
				expected: [
					['row6col1', 'row6col2', 'row6col3'],
					['row7col1', 'row6col2', 'row7col3']
				]
			}
		];

		const ss = new SpreadsheetService( '', columns, 0, mockRows );
		cases.forEach( c => {
			it( c.msg, () => {
				expect( ss.getRowsByColumn( c.input.col, c.input.val, c.input.responseCol ) )
					.to.deep.equal( c.expected );
			} );
		} );
	} );

	describe( 'getResultObjectByColumn', () => {
		const cases = [
			{
				msg: 'Single result',
				input: {
					col: 'col1',
					val: 'row2col1',
					random: false
				},
				expected: [
					{
						col1: 'row2col1',
						col2: 'row2col2',
						col3: 'row2col3'
					}
				]
			},
			{
				msg: 'Multiple results',
				input: {
					col: 'col2',
					val: 'row6col2',
					random: false
				},
				expected: [
					{
						col1: 'row6col1',
						col2: 'row6col2',
						col3: 'row6col3'
					},
					{
						col1: 'row7col1',
						col2: 'row6col2',
						col3: 'row7col3'
					}
				]
			},
			{
				msg: 'No results',
				input: {
					col: 'col1',
					val: 'foo',
					random: false
				},
				expected: []
			}
			// TODO: Test random
		];

		const ss = new SpreadsheetService( '', columns, 0, mockRows );
		cases.forEach( c => {
			it( c.msg, () => {
				expect( ss.getResultObjectByColumn( c.input.col, c.input.val, c.input.random ) )
					.to.deep.equal( c.expected );
			} );
		} );
	} );
} );
