jest.mock('../../src/db/connection', () => ({ execute: jest.fn() }));

const pool = require('../../src/db/connection');
const service = require('../../src/services/candidates.service');

beforeEach(() => jest.clearAllMocks());

describe('candidates.service.findAllByOrg', () => {
  it('scopea por organizationId y parsea skills', async () => {
    pool.execute.mockResolvedValueOnce([[
      { id: 1, organizationId: 7, name: 'Ana', skills: '["Angular","Node.js"]' },
      { id: 2, organizationId: 7, name: 'Luis', skills: null },
    ]]);

    const result = await service.findAllByOrg(7);

    expect(pool.execute).toHaveBeenCalledWith(
      expect.stringMatching(/WHERE organizationId = \?/),
      [7]
    );
    expect(result[0].skills).toEqual(['Angular', 'Node.js']);
    expect(result[1].skills).toEqual([]);
  });
});

describe('candidates.service.findOneByOrg', () => {
  it('devuelve null si no existe', async () => {
    pool.execute.mockResolvedValueOnce([[]]);
    expect(await service.findOneByOrg(99, 7)).toBeNull();
  });
});

describe('candidates.service.create', () => {
  it('inserta con seniority por defecto y serializa skills', async () => {
    pool.execute
      .mockResolvedValueOnce([{ insertId: 10 }])
      .mockResolvedValueOnce([[{ id: 10, name: 'Ana', skills: '["Angular"]' }]]);

    const result = await service.create(7, 1, { name: 'Ana', skills: ['Angular'] });

    expect(pool.execute).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('INSERT INTO candidates'),
      [7, 'Ana', null, null, 'mid', '["Angular"]', null, null, 1]
    );
    expect(result.skills).toEqual(['Angular']);
  });
});

describe('candidates.service.update', () => {
  it('lanza 404 si no pertenece a la org', async () => {
    pool.execute.mockResolvedValueOnce([[]]);
    await expect(service.update(1, 7, { name: 'X' })).rejects.toMatchObject({ status: 404 });
  });

  it('actualiza solo campos provistos', async () => {
    pool.execute
      .mockResolvedValueOnce([[{ id: 1, organizationId: 7, name: 'old', skills: '[]' }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[{ id: 1, name: 'new', skills: '[]' }]]);

    const result = await service.update(1, 7, { name: 'new' });
    expect(result.name).toBe('new');
  });
});

describe('candidates.service.remove', () => {
  it('lanza 404 si no existe', async () => {
    pool.execute.mockResolvedValueOnce([[]]);
    await expect(service.remove(99, 7)).rejects.toMatchObject({ status: 404 });
  });

  it('elimina si pertenece a la org', async () => {
    pool.execute
      .mockResolvedValueOnce([[{ id: 1, organizationId: 7 }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);
    await service.remove(1, 7);
    expect(pool.execute).toHaveBeenLastCalledWith(
      expect.stringContaining('DELETE FROM candidates'),
      [1, 7]
    );
  });
});
