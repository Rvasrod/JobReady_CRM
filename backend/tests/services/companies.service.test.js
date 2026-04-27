jest.mock('../../src/db/connection', () => ({ execute: jest.fn() }));

const pool = require('../../src/db/connection');
const service = require('../../src/services/companies.service');

beforeEach(() => jest.clearAllMocks());

describe('companies.service.findAllByUser', () => {
  it('devuelve todas las empresas del usuario ordenadas DESC', async () => {
    const rows = [{ id: 2 }, { id: 1 }];
    pool.execute.mockResolvedValueOnce([rows]);

    const result = await service.findAllByUser(7);

    expect(pool.execute).toHaveBeenCalledWith(expect.stringMatching(/ORDER BY createdAt DESC/), [7]);
    expect(result).toEqual(rows);
  });
});

describe('companies.service.findOneByUser', () => {
  it('devuelve la empresa si pertenece al usuario', async () => {
    pool.execute.mockResolvedValueOnce([[{ id: 1, userId: 7 }]]);
    const result = await service.findOneByUser(1, 7);
    expect(result).toEqual({ id: 1, userId: 7 });
  });

  it('devuelve null si no existe', async () => {
    pool.execute.mockResolvedValueOnce([[]]);
    expect(await service.findOneByUser(99, 7)).toBeNull();
  });
});

describe('companies.service.create', () => {
  it('inserta y devuelve la empresa creada', async () => {
    pool.execute
      .mockResolvedValueOnce([{ insertId: 10 }])
      .mockResolvedValueOnce([[{ id: 10, name: 'Acme' }]]);

    const result = await service.create(7, { name: 'Acme' });

    expect(result).toEqual({ id: 10, name: 'Acme' });
    expect(pool.execute).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('INSERT INTO companies'),
      [7, 'Acme', null, null, null, 0]
    );
  });
});

describe('companies.service.update', () => {
  it('actualiza si la empresa pertenece al usuario', async () => {
    pool.execute
      .mockResolvedValueOnce([[{ id: 1 }]]) // findOneByUser
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE
      .mockResolvedValueOnce([[{ id: 1, name: 'New' }]]); // SELECT

    const result = await service.update(1, 7, { name: 'New' });
    expect(result.name).toBe('New');
  });

  it('lanza 404 si la empresa no es del usuario', async () => {
    pool.execute.mockResolvedValueOnce([[]]);
    await expect(service.update(1, 7, { name: 'x' })).rejects.toMatchObject({ status: 404 });
  });
});

describe('companies.service.remove', () => {
  it('elimina si la empresa pertenece al usuario', async () => {
    pool.execute
      .mockResolvedValueOnce([[{ id: 1 }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    await service.remove(1, 7);

    expect(pool.execute).toHaveBeenLastCalledWith(
      expect.stringContaining('DELETE FROM companies'),
      [1, 7]
    );
  });

  it('lanza 404 si no existe', async () => {
    pool.execute.mockResolvedValueOnce([[]]);
    await expect(service.remove(99, 7)).rejects.toMatchObject({ status: 404 });
  });
});
