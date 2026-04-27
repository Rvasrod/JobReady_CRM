const pool = require('../db/connection');

function notFound() {
  const err = new Error('Candidato no encontrado');
  err.status = 404;
  return err;
}

function parseSkills(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return []; }
  }
  return [];
}

function shape(row) {
  if (!row) return null;
  return { ...row, skills: parseSkills(row.skills) };
}

async function findAllByOrg(organizationId) {
  const [rows] = await pool.execute(
    'SELECT * FROM candidates WHERE organizationId = ? ORDER BY createdAt DESC',
    [organizationId]
  );
  return rows.map(shape);
}

async function findOneByOrg(id, organizationId) {
  const [rows] = await pool.execute(
    'SELECT * FROM candidates WHERE id = ? AND organizationId = ?',
    [id, organizationId]
  );
  return shape(rows[0] ?? null);
}

async function create(organizationId, userId, payload) {
  const { name, email, phone, seniority, skills, linkedinUrl, notes } = payload;
  const [result] = await pool.execute(
    `INSERT INTO candidates
      (organizationId, name, email, phone, seniority, skills, linkedinUrl, notes, createdBy)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      organizationId,
      name,
      email ?? null,
      phone ?? null,
      seniority ?? 'mid',
      JSON.stringify(skills ?? []),
      linkedinUrl ?? null,
      notes ?? null,
      userId ?? null,
    ]
  );
  return findOneByOrg(result.insertId, organizationId);
}

async function update(id, organizationId, payload) {
  const existing = await findOneByOrg(id, organizationId);
  if (!existing) throw notFound();

  const { name, email, phone, seniority, skills, linkedinUrl, notes } = payload;
  const skillsParam = skills !== undefined ? JSON.stringify(skills) : null;
  await pool.execute(
    `UPDATE candidates SET
       name        = COALESCE(?, name),
       email       = COALESCE(?, email),
       phone       = COALESCE(?, phone),
       seniority   = COALESCE(?, seniority),
       skills      = COALESCE(?, skills),
       linkedinUrl = COALESCE(?, linkedinUrl),
       notes       = COALESCE(?, notes)
     WHERE id = ? AND organizationId = ?`,
    [
      name ?? null,
      email ?? null,
      phone ?? null,
      seniority ?? null,
      skillsParam,
      linkedinUrl ?? null,
      notes ?? null,
      id,
      organizationId,
    ]
  );
  return findOneByOrg(id, organizationId);
}

async function remove(id, organizationId) {
  const existing = await findOneByOrg(id, organizationId);
  if (!existing) throw notFound();
  await pool.execute(
    'DELETE FROM candidates WHERE id = ? AND organizationId = ?',
    [id, organizationId]
  );
}

module.exports = { findAllByOrg, findOneByOrg, create, update, remove };
