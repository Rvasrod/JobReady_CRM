const pool = require('../db/connection');

function notFound() {
  const err = new Error('Empresa no encontrada');
  err.status = 404;
  return err;
}

async function findAllByUser(userId) {
  const [rows] = await pool.execute(
    'SELECT * FROM companies WHERE userId = ? ORDER BY createdAt DESC',
    [userId]
  );
  return rows;
}

async function findOneByUser(id, userId) {
  const [rows] = await pool.execute(
    'SELECT * FROM companies WHERE id = ? AND userId = ?',
    [id, userId]
  );
  return rows[0] ?? null;
}

async function create(userId, payload) {
  const { name, sector, website, notes, rating } = payload;
  const [result] = await pool.execute(
    'INSERT INTO companies (userId, name, sector, website, notes, rating) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, name, sector ?? null, website ?? null, notes ?? null, rating ?? 0]
  );
  const [rows] = await pool.execute('SELECT * FROM companies WHERE id = ?', [result.insertId]);
  return rows[0];
}

async function update(id, userId, payload) {
  const existing = await findOneByUser(id, userId);
  if (!existing) throw notFound();

  const { name, sector, website, notes, rating } = payload;
  await pool.execute(
    `UPDATE companies
        SET name = COALESCE(?, name),
            sector = COALESCE(?, sector),
            website = COALESCE(?, website),
            notes = COALESCE(?, notes),
            rating = COALESCE(?, rating)
      WHERE id = ?`,
    [name ?? null, sector ?? null, website ?? null, notes ?? null, rating ?? null, id]
  );
  const [rows] = await pool.execute('SELECT * FROM companies WHERE id = ?', [id]);
  return rows[0];
}

async function remove(id, userId) {
  const existing = await findOneByUser(id, userId);
  if (!existing) throw notFound();
  await pool.execute('DELETE FROM companies WHERE id = ? AND userId = ?', [id, userId]);
}

module.exports = { findAllByUser, findOneByUser, create, update, remove };
