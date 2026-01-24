import { QueryParserUtil } from '../query-parser.util';

describe('QueryParserUtil', () => {
  it('parses sort expressions with mapped fields', () => {
    const result = QueryParserUtil.parse(
      { sort: 'created_at:desc' },
      { sortMapping: { created_at: 'recipe.created_at' } },
    );

    expect(result.sort).toEqual([
      {
        field: 'created_at',
        column: 'recipe.created_at',
        direction: 'DESC',
      },
    ]);
  });

  it('throws for invalid sort direction', () => {
    expect(() =>
      QueryParserUtil.parse(
        { sort: 'created_at:down' },
        { sortMapping: { created_at: 'recipe.created_at' } },
      ),
    ).toThrow(/Sorting direction/);
  });

  it('parses filter expressions with numeric casting and IN operator', () => {
    const result = QueryParserUtil.parse(
      { filter: 'total_time_min:in:30|45' },
      {
        filterMapping: {
          total_time_min: { column: 'recipe.total_time_min', type: 'number', allowedOperators: ['in'] },
        },
      },
    );

    expect(result.filter).toEqual([
      {
        field: 'total_time_min',
        column: 'recipe.total_time_min',
        operator: 'in',
        value: [30, 45],
        rawValue: '30|45',
      },
    ]);
  });

  it('throws for disallowed filter field', () => {
    expect(() =>
      QueryParserUtil.parse(
        { filter: 'title:eq:Soup' },
        { filterMapping: { difficulty: { column: 'recipe.difficulty' } } },
      ),
    ).toThrow(/Filtering by the requested field is not allowed/);
  });
});