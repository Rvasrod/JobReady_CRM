jest.mock('../../src/db/connection', () => ({ execute: jest.fn() }));
jest.mock('bcrypt', () => ({ hash: jest.fn(), compare: jest.fn() }));
jest.mock('jsonwebtoken', () => ({ sign: jest.fn(() => 'fake-token') }));
jest.mock('../../src/services/organizations.service', () => ({
  create: jest.fn(),
  findByInviteCode: jest.fn(),
}));

const pool = require('../../src/db/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const orgService = require('../../src/services/organizations.service');
const authService = require('../../src/services/auth.service');

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret';
});

describe('auth.service.register — alta de organización (admin)', () => {
  it('crea una organización nueva y al usuario como admin', async () => {
    pool.execute
      .mockResolvedValueOnce([[]]) // findUserByEmail → no existe
      .mockResolvedValueOnce([{ insertId: 42 }]); // INSERT user
    orgService.create.mockResolvedValue({ id: 9, name: 'AccioSoft', inviteCode: 'ABC123' });
    bcrypt.hash.mockResolvedValue('hashed-pw');

    const result = await authService.register({
      name: 'Roberto',
      email: 'r@test.com',
      password: 'secret123',
      organizationName: 'AccioSoft',
    });

    expect(orgService.create).toHaveBeenCalledWith('AccioSoft');
    expect(bcrypt.hash).toHaveBeenCalledWith('secret123', 12);
    expect(result.user).toEqual({
      id: 42,
      name: 'Roberto',
      email: 'r@test.com',
      organizationId: 9,
      role: 'admin',
    });
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({ id: 42, organizationId: 9, role: 'admin' }),
      'test-secret',
      { expiresIn: '7d' }
    );
  });
});

describe('auth.service.register — alta por invitación (recruiter)', () => {
  it('valida el inviteCode y crea al usuario como recruiter', async () => {
    pool.execute
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 7 }]);
    orgService.findByInviteCode.mockResolvedValue({ id: 3, name: 'AccioSoft', inviteCode: 'ABC123' });
    bcrypt.hash.mockResolvedValue('hashed');

    const result = await authService.register({
      name: 'Ana',
      email: 'a@a.com',
      password: 'pw1234',
      inviteCode: 'ABC123',
    });

    expect(orgService.findByInviteCode).toHaveBeenCalledWith('ABC123');
    expect(orgService.create).not.toHaveBeenCalled();
    expect(result.user.role).toBe('recruiter');
    expect(result.user.organizationId).toBe(3);
  });

  it('lanza 400 si el inviteCode no existe', async () => {
    pool.execute.mockResolvedValueOnce([[]]); // findUserByEmail
    orgService.findByInviteCode.mockResolvedValue(null);

    await expect(
      authService.register({
        name: 'X',
        email: 'x@x.com',
        password: 'pwxxxx',
        inviteCode: 'BAD',
      })
    ).rejects.toMatchObject({ status: 400, message: /invitación/i });
  });
});

describe('auth.service.register — email duplicado', () => {
  it('lanza 400 antes de tocar la organización', async () => {
    pool.execute.mockResolvedValueOnce([[{ id: 1 }]]); // user existe

    await expect(
      authService.register({
        name: 'X',
        email: 'x@x.com',
        password: 'a-secret',
        organizationName: 'Foo',
      })
    ).rejects.toMatchObject({ status: 400, message: /ya está registrado/i });

    expect(orgService.create).not.toHaveBeenCalled();
    expect(orgService.findByInviteCode).not.toHaveBeenCalled();
  });
});

describe('auth.service.login', () => {
  it('devuelve token y usuario con organizationId y role', async () => {
    pool.execute.mockResolvedValueOnce([[
      { id: 7, name: 'Ana', email: 'a@a.com', password: 'hashed', organizationId: 3, role: 'recruiter' },
    ]]);
    bcrypt.compare.mockResolvedValue(true);

    const result = await authService.login({ email: 'a@a.com', password: 'pw' });

    expect(result.user).toEqual({
      id: 7,
      name: 'Ana',
      email: 'a@a.com',
      organizationId: 3,
      role: 'recruiter',
    });
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: 3, role: 'recruiter' }),
      'test-secret',
      expect.any(Object)
    );
  });

  it('lanza 401 si el usuario no existe', async () => {
    pool.execute.mockResolvedValueOnce([[]]);
    await expect(
      authService.login({ email: 'no@x.com', password: 'pw' })
    ).rejects.toMatchObject({ status: 401 });
  });

  it('lanza 401 si la contraseña es incorrecta', async () => {
    pool.execute.mockResolvedValueOnce([[
      { id: 1, name: 'X', email: 'x@x.com', password: 'hashed', organizationId: 1, role: 'admin' },
    ]]);
    bcrypt.compare.mockResolvedValue(false);
    await expect(
      authService.login({ email: 'x@x.com', password: 'bad' })
    ).rejects.toMatchObject({ status: 401 });
  });
});

describe('auth.service.getProfile', () => {
  it('devuelve el usuario con organizationName', async () => {
    pool.execute.mockResolvedValueOnce([[
      { id: 5, name: 'L', email: 'l@l.com', role: 'admin', organizationId: 2, organizationName: 'AccioSoft' },
    ]]);
    const user = await authService.getProfile(5);
    expect(user.id).toBe(5);
    expect(user.organizationName).toBe('AccioSoft');
  });

  it('lanza 404 si no existe', async () => {
    pool.execute.mockResolvedValueOnce([[]]);
    await expect(authService.getProfile(999)).rejects.toMatchObject({ status: 404 });
  });
});
