const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/connection');
const orgService = require('./organizations.service');

const BCRYPT_ROUNDS = 12;
const JWT_EXPIRES_IN = '7d';

async function findUserByEmail(email) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] ?? null;
}

async function findUserById(id) {
  const [rows] = await pool.execute(
    `SELECT u.id, u.name, u.email, u.role, u.organizationId, u.createdAt,
            o.name AS organizationName, o.inviteCode AS organizationInviteCode
       FROM users u
       JOIN organizations o ON o.id = u.organizationId
      WHERE u.id = ?`,
    [id]
  );
  return rows[0] ?? null;
}

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

async function resolveOrganization({ organizationName, inviteCode }) {
  if (inviteCode) {
    const org = await orgService.findByInviteCode(inviteCode);
    if (!org) {
      const err = new Error('Código de invitación no válido');
      err.status = 400;
      throw err;
    }
    return { organizationId: org.id, role: 'recruiter' };
  }
  const org = await orgService.create(organizationName);
  return { organizationId: org.id, role: 'admin' };
}

async function register({ name, email, password, organizationName, inviteCode }) {
  if (await findUserByEmail(email)) {
    const err = new Error('El email ya está registrado');
    err.status = 400;
    throw err;
  }

  const { organizationId, role } = await resolveOrganization({ organizationName, inviteCode });

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const [result] = await pool.execute(
    'INSERT INTO users (organizationId, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
    [organizationId, name, email, hashedPassword, role]
  );

  const user = { id: result.insertId, name, email, organizationId, role };
  return { token: signToken(user), user };
}

async function login({ email, password }) {
  const dbUser = await findUserByEmail(email);
  if (!dbUser) {
    const err = new Error('Credenciales incorrectas');
    err.status = 401;
    throw err;
  }

  const isValid = await bcrypt.compare(password, dbUser.password);
  if (!isValid) {
    const err = new Error('Credenciales incorrectas');
    err.status = 401;
    throw err;
  }

  const user = {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    organizationId: dbUser.organizationId,
    role: dbUser.role,
  };
  return { token: signToken(user), user };
}

async function getProfile(userId) {
  const user = await findUserById(userId);
  if (!user) {
    const err = new Error('Usuario no encontrado');
    err.status = 404;
    throw err;
  }
  return user;
}

module.exports = { register, login, getProfile };
