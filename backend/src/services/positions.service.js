const pool = require('../db/connection');

function notFound() {
  const err = new Error('Posición no encontrada');
  err.status = 404;
  return err;
}

async function findAllByOrg(organizationId) {
  const [rows] = await pool.execute(
    'SELECT * FROM positions WHERE organizationId = ? ORDER BY createdAt DESC',
    [organizationId]
  );
  return rows;
}

async function findOneByOrg(id, organizationId) {
  const [rows] = await pool.execute(
    'SELECT * FROM positions WHERE id = ? AND organizationId = ?',
    [id, organizationId]
  );
  return rows[0] ?? null;
}

async function create(organizationId, userId, payload) {
  const { 
    title, description, requirements, seniority, status, 
    location, salary, modality, department 
  } = payload;
  const [result] = await pool.execute(
    `INSERT INTO positions 
     (organizationId, title, description, requirements, seniority, status, location, salary, modality, department, createdBy)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      organizationId,
      title,
      description ?? null,
      requirements ?? null,
      seniority ?? 'mid',
      status ?? 'open',
      location ?? null,
      salary ?? null,
      modality ?? 'presential',
      department ?? null,
      userId ?? null,
    ]
  );
  return findOneByOrg(result.insertId, organizationId);
}

async function update(id, organizationId, payload) {
  const existing = await findOneByOrg(id, organizationId);
  if (!existing) throw notFound();

  const { 
    title, description, requirements, seniority, status, 
    location, salary, modality, department 
  } = payload;
  await pool.execute(
    `UPDATE positions SET
       title       = COALESCE(?, title),
       description = COALESCE(?, description),
       requirements = COALESCE(?, requirements),
       seniority   = COALESCE(?, seniority),
       status      = COALESCE(?, status),
       location    = COALESCE(?, location),
       salary      = COALESCE(?, salary),
       modality    = COALESCE(?, modality),
       department  = COALESCE(?, department)
     WHERE id = ? AND organizationId = ?`,
    [
      title ?? null,
      description ?? null,
      requirements ?? null,
      seniority ?? null,
      status ?? null,
      location ?? null,
      salary ?? null,
      modality ?? null,
      department ?? null,
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
    'DELETE FROM positions WHERE id = ? AND organizationId = ?',
    [id, organizationId]
  );
}

module.exports = { findAllByOrg, findOneByOrg, create, update, remove };