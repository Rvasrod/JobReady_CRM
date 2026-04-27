jest.mock('../../src/db/connection', () => ({ execute: jest.fn() }));
jest.mock('bcrypt', () => ({ hash: jest.fn(), compare: jest.fn() }));
jest.mock('jsonwebtoken', () => ({ sign: jest.fn(() => 'fake-token') }));

const pool = require('../../src/db/connection');
const bcrypt = require('bcrypt');
const authService = require('../../src/services/auth.service');

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret';
});

describe('auth.service.register', () => {
  it('crea un usuario nuevo y devuelve token + user', async () => {
    pool.execute
      .mockResolvedValueOnce([[]]) // findUserByEmail → no existe
      .mockResolvedValueOnce([{ insertId: 42 }]); // INSERT
    bcrypt.hash.mockResolvedValue('hashed-pw');

    const result = await authService.register({
      name: 'Roberto',
      email: 'r@test.com',
      password: 'secret123',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('secret123', 12);
    expect(result.token).toBe('fake-token');
    expect(result.user).toEqual({ id: 42, name: 'Roberto', email: 'r@test.com' });
  });

  it('lanza 400 si el email ya existe', async () => {
    pool.execute.mockResolvedValueOnce([[{ id: 1 }]]);

    await expect(
      authService.register({ name: 'X', email: 'x@x.com', password: 'a-secret' })
    ).rejects.toMatchObject({ status: 400, message: /ya está registrado/i });
  });
});

describe('auth.service.login', () => {
  it('devuelve token y usuario con credenciales válidas', async () => {
    pool.execute.mockResolvedValueOnce([[
      { id: 7, name: 'Ana', email: 'a@a.com', password: 'hashed' },
    ]]);
    bcrypt.compare.mockResolvedValue(true);

    const result = await authService.login({ email: 'a@a.com', password: 'pw' });

    expect(result.token).toBe('fake-token');
    expect(result.user).toEqual({ id: 7, name: 'Ana', email: 'a@a.com' });
  });

  it('lanza 401 si el usuario no existe', async () => {
    pool.execute.mockResolvedValueOnce([[]]);
    await expect(
      authService.login({ email: 'no@x.com', password: 'pw' })
    ).rejects.toMatchObject({ status: 401 });
  });

  it('lanza 401 si la contraseña es incorrecta', async () => {
    pool.execute.mockResolvedValueOnce([[
      { id: 1, name: 'X', email: 'x@x.com', password: 'hashed' },
    ]]);
    bcrypt.compare.mockResolvedValue(false);
    await expect(
      authService.login({ email: 'x@x.com', password: 'bad' })
    ).rejects.toMatchObject({ status: 401 });
  });
});

describe('auth.service.getProfile', () => {
  it('devuelve el usuario por id', async () => {
    pool.execute.mockResolvedValueOnce([[
      { id: 5, name: 'L', email: 'l@l.com', createdAt: '2025-01-01' },
    ]]);
    const user = await authService.getProfile(5);
    expect(user.id).toBe(5);
  });

  it('lanza 404 si no existe', async () => {
    pool.execute.mockResolvedValueOnce([[]]);
    await expect(authService.getProfile(999)).rejects.toMatchObject({ status: 404 });
  });
});
