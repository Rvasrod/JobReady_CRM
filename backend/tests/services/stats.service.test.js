jest.mock('../../src/db/connection', () => ({ execute: jest.fn() }));

const pool = require('../../src/db/connection');
const service = require('../../src/services/stats.service');

beforeEach(() => jest.clearAllMocks());

describe('stats.service.getDashboard', () => {
  it('agrega total, avgRating, bySector, byRating y recent', async () => {
    pool.execute
      .mockResolvedValueOnce([[{ total: 5 }]]) // total
      .mockResolvedValueOnce([[{ sector: 'SaaS', count: 3 }, { sector: 'Fintech', count: 2 }]]) // bySector
      .mockResolvedValueOnce([[{ rating: 5, count: 1 }, { rating: 4, count: 2 }]]) // byRating
      .mockResolvedValueOnce([[{ avg_rating: 4.2 }]]) // avg
      .mockResolvedValueOnce([[{ id: 1, name: 'Acme' }]]); // recent

    const data = await service.getDashboard(7);

    expect(data.total).toBe(5);
    expect(data.avgRating).toBe(4.2);
    expect(data.bySector).toHaveLength(2);
    expect(data.byRating).toHaveLength(2);
    expect(data.recent).toEqual([{ id: 1, name: 'Acme' }]);
  });

  it('devuelve avgRating=0 cuando no hay ratings', async () => {
    pool.execute
      .mockResolvedValueOnce([[{ total: 0 }]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ avg_rating: null }]])
      .mockResolvedValueOnce([[]]);

    const data = await service.getDashboard(7);
    expect(data.avgRating).toBe(0);
  });
});
