const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/connection');

const BCRYPT_ROUNDS = 12;
const JWT_EXPIRES_IN = '7d';

async function findUserByEmail(email) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] ?? null;
}

async function findUserById(id) {
  const [rows] = await pool.execute(
    'SELECT id, name, email, createdAt FROM users WHERE id = ?',
    [id]
  );
  return rows[0] ?? null;
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

async function register({ name, email, password }) {
  if (await findUserByEmail(email)) {
    const err = new Error('El email ya está registrado');
    err.status = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, hashedPassword]
  );

  const user = { id: result.insertId, name, email };
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

  const user = { id: dbUser.id, name: dbUser.name, email: dbUser.email };
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
