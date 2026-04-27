jest.mock('../../src/db/connection', () => ({ execute: jest.fn() }));

const pool = require('../../src/db/connection');
const orgService = require('../../src/services/organizations.service');

beforeEach(() => jest.clearAllMocks());

describe('organizations.service.generateInviteCode', () => {
  it('genera códigos no vacíos en mayúsculas', () => {
    const code = orgService.generateInviteCode();
    expect(code).toMatch(/^[A-Z0-9]+$/);
    expect(code.length).toBeGreaterThanOrEqual(4);
  });
});

describe('organizations.service.findByInviteCode', () => {
  it('devuelve la organización si existe', async () => {
    pool.execute.mockResolvedValueOnce([[{ id: 1, name: 'AccioSoft', inviteCode: 'ABC123' }]]);
    const org = await orgService.findByInviteCode('ABC123');
    expect(org).toEqual(expect.objectContaining({ id: 1, inviteCode: 'ABC123' }));
  });

  it('devuelve null si no existe', async () => {
    pool.execute.mockResolvedValueOnce([[]]);
    expect(await orgService.findByInviteCode('NONE')).toBeNull();
  });
});

describe('organizations.service.create', () => {
  it('inserta la organización con un inviteCode generado', async () => {
    pool.execute.mockResolvedValueOnce([{ insertId: 5 }]);
    const org = await orgService.create('AccioSoft');
    expect(org.id).toBe(5);
    expect(org.name).toBe('AccioSoft');
    expect(org.inviteCode).toMatch(/^[A-Z0-9]+$/);
  });

  it('reintenta si el primer inviteCode colisiona', async () => {
    const dupErr = Object.assign(new Error('dup'), { code: 'ER_DUP_ENTRY' });
    pool.execute
      .mockRejectedValueOnce(dupErr)
      .mockResolvedValueOnce([{ insertId: 6 }]);

    const org = await orgService.create('Acme');
    expect(org.id).toBe(6);
    expect(pool.execute).toHaveBeenCalledTimes(2);
  });
});
