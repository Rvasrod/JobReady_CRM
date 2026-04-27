jest.mock('../../src/db/connection', () => ({ execute: jest.fn() }));

const pool = require('../../src/db/connection');
const service = require('../../src/services/positions.service');

beforeEach(() => jest.clearAllMocks());

describe('positions.service.findAllByOrg', () => {
  it('scopea por organizationId', async () => {
    pool.execute.mockResolvedValueOnce([[{ id: 1, title: 'Senior Angular' }]]);
    const result = await service.findAllByOrg(7);
    expect(pool.execute).toHaveBeenCalledWith(
      expect.stringMatching(/WHERE organizationId = \?/),
      [7]
    );
    expect(result).toHaveLength(1);
  });
});

describe('positions.service.create', () => {
  it('inserta con status open por defecto', async () => {
    pool.execute
      .mockResolvedValueOnce([{ insertId: 5 }])
      .mockResolvedValueOnce([[{ id: 5, title: 'Senior Angular', status: 'open' }]]);

    const result = await service.create(7, 1, { title: 'Senior Angular' });

    expect(pool.execute).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('INSERT INTO positions'),
      [7, 'Senior Angular', null, 'mid', 'open', 1]
    );
    expect(result.status).toBe('open');
  });
});

describe('positions.service.update', () => {
  it('lanza 404 si no pertenece a la org', async () => {
    pool.execute.mockResolvedValueOnce([[]]);
    await expect(service.update(1, 7, { title: 'x' })).rejects.toMatchObject({ status: 404 });
  });
});

describe('positions.service.remove', () => {
  it('elimina si pertenece a la org', async () => {
    pool.execute
      .mockResolvedValueOnce([[{ id: 1, organizationId: 7 }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);
    await service.remove(1, 7);
    expect(pool.execute).toHaveBeenLastCalledWith(
      expect.stringContaining('DELETE FROM positions'),
      [1, 7]
    );
  });
});
