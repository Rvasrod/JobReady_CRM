jest.mock('../../src/db/connection', () => ({ execute: jest.fn() }));

const pool = require('../../src/db/connection');
const service = require('../../src/services/applications.service');

beforeEach(() => jest.clearAllMocks());

describe('applications.service.findAllByOrg', () => {
  it('hace JOIN con candidates y positions, scopeando por org', async () => {
    pool.execute.mockResolvedValueOnce([[
      { id: 1, candidateName: 'Ana', positionTitle: 'Senior Angular' },
    ]]);

    const result = await service.findAllByOrg(7);

    const sqlArg = pool.execute.mock.calls[0][0];
    expect(sqlArg).toMatch(/JOIN candidates/);
    expect(sqlArg).toMatch(/JOIN positions/);
    expect(sqlArg).toMatch(/a\.organizationId = \?/);
    expect(result[0].candidateName).toBe('Ana');
  });
});

describe('applications.service.create', () => {
  it('verifica que candidato y posición pertenecen a la org', async () => {
    pool.execute
      .mockResolvedValueOnce([[{ organizationId: 7 }]]) // candidate check
      .mockResolvedValueOnce([[{ organizationId: 7 }]]) // position check
      .mockResolvedValueOnce([{ insertId: 100 }]) // insert
      .mockResolvedValueOnce([[{ id: 100, candidateName: 'Ana', positionTitle: 'X' }]]); // findOneByOrg

    const result = await service.create(7, { candidateId: 1, positionId: 2 });

    expect(result.id).toBe(100);
  });

  it('lanza 400 si el candidato es de otra org', async () => {
    pool.execute.mockResolvedValueOnce([[{ organizationId: 99 }]]);
    await expect(
      service.create(7, { candidateId: 1, positionId: 2 })
    ).rejects.toMatchObject({ status: 400, message: /Candidato/ });
  });

  it('lanza 400 si la posición es de otra org', async () => {
    pool.execute
      .mockResolvedValueOnce([[{ organizationId: 7 }]])
      .mockResolvedValueOnce([[{ organizationId: 99 }]]);
    await expect(
      service.create(7, { candidateId: 1, positionId: 2 })
    ).rejects.toMatchObject({ status: 400, message: /Posición/ });
  });
});

describe('applications.service.updateStatus', () => {
  it('cambia el estado si es válido', async () => {
    pool.execute
      .mockResolvedValueOnce([[{ id: 1, organizationId: 7, status: 'applied' }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[{ id: 1, status: 'interview' }]]);

    const result = await service.updateStatus(1, 7, 'interview');
    expect(result.status).toBe('interview');
  });

  it('lanza 400 si el estado no está en la whitelist', async () => {
    await expect(service.updateStatus(1, 7, 'magic')).rejects.toMatchObject({ status: 400 });
  });

  it('lanza 404 si la aplicación no pertenece a la org', async () => {
    pool.execute.mockResolvedValueOnce([[]]);
    await expect(service.updateStatus(1, 7, 'interview')).rejects.toMatchObject({ status: 404 });
  });
});

describe('applications.service.remove', () => {
  it('lanza 404 si no existe', async () => {
    pool.execute.mockResolvedValueOnce([[]]);
    await expect(service.remove(99, 7)).rejects.toMatchObject({ status: 404 });
  });
});
