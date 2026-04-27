const pool = require('../db/connection');

const MAX_INVITE_CODE_RETRIES = 5;

function generateInviteCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT id, name, inviteCode, createdAt FROM organizations WHERE id = ?',
    [id]
  );
  return rows[0] ?? null;
}

async function findByInviteCode(code) {
  const [rows] = await pool.execute(
    'SELECT id, name, inviteCode, createdAt FROM organizations WHERE inviteCode = ?',
    [code]
  );
  return rows[0] ?? null;
}

async function create(name) {
  for (let attempt = 0; attempt < MAX_INVITE_CODE_RETRIES; attempt++) {
    const inviteCode = generateInviteCode();
    try {
      const [result] = await pool.execute(
        'INSERT INTO organizations (name, inviteCode) VALUES (?, ?)',
        [name, inviteCode]
      );
      return { id: result.insertId, name, inviteCode };
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY' && attempt < MAX_INVITE_CODE_RETRIES - 1) continue;
      throw err;
    }
  }
}

module.exports = { findById, findByInviteCode, create, generateInviteCode };
