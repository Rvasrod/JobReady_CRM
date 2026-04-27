const pool = require('../db/connection');

const VALID_STATUSES = [
  'applied', 'cv_review', 'interview', 'technical_test', 'offer', 'hired', 'rejected',
];

function notFound() {
  const err = new Error('Aplicación no encontrada');
  err.status = 404;
  return err;
}

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

const SELECT_WITH_JOIN = `
  SELECT a.*,
         c.name      AS candidateName,
         c.email     AS candidateEmail,
         c.seniority AS candidateSeniority,
         p.title     AS positionTitle,
         p.seniority AS positionSeniority
    FROM applications a
    JOIN candidates c ON c.id = a.candidateId
    JOIN positions  p ON p.id = a.positionId
`;

async function findAllByOrg(organizationId) {
  const [rows] = await pool.execute(
    `${SELECT_WITH_JOIN} WHERE a.organizationId = ? ORDER BY a.updatedAt DESC`,
    [organizationId]
  );
  return rows;
}

async function findOneByOrg(id, organizationId) {
  const [rows] = await pool.execute(
    `${SELECT_WITH_JOIN} WHERE a.id = ? AND a.organizationId = ?`,
    [id, organizationId]
  );
  return rows[0] ?? null;
}

async function assertOwnedByOrg(table, id, organizationId, errorMessage) {
  const [rows] = await pool.execute(
    `SELECT organizationId FROM ${table} WHERE id = ?`,
    [id]
  );
  if (!rows[0] || rows[0].organizationId !== organizationId) {
    throw badRequest(errorMessage);
  }
}

async function create(organizationId, payload) {
  const { candidateId, positionId, status, appliedAt, notes } = payload;
  await assertOwnedByOrg('candidates', candidateId, organizationId, 'Candidato no válido');
  await assertOwnedByOrg('positions', positionId, organizationId, 'Posición no válida');

  const [result] = await pool.execute(
    `INSERT INTO applications
      (organizationId, candidateId, positionId, status, appliedAt, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      organizationId,
      candidateId,
      positionId,
      status ?? 'applied',
      appliedAt ?? null,
      notes ?? null,
    ]
  );
  return findOneByOrg(result.insertId, organizationId);
}

async function update(id, organizationId, payload) {
  const existing = await findOneByOrg(id, organizationId);
  if (!existing) throw notFound();

  const { status, appliedAt, notes } = payload;
  await pool.execute(
    `UPDATE applications SET
       status    = COALESCE(?, status),
       appliedAt = COALESCE(?, appliedAt),
       notes     = COALESCE(?, notes)
     WHERE id = ? AND organizationId = ?`,
    [status ?? null, appliedAt ?? null, notes ?? null, id, organizationId]
  );
  return findOneByOrg(id, organizationId);
}

async function updateStatus(id, organizationId, newStatus) {
  if (!VALID_STATUSES.includes(newStatus)) {
    throw badRequest('Status inválido');
  }
  const existing = await findOneByOrg(id, organizationId);
  if (!existing) throw notFound();
  await pool.execute(
    'UPDATE applications SET status = ? WHERE id = ? AND organizationId = ?',
    [newStatus, id, organizationId]
  );
  return findOneByOrg(id, organizationId);
}

async function remove(id, organizationId) {
  const existing = await findOneByOrg(id, organizationId);
  if (!existing) throw notFound();
  await pool.execute(
    'DELETE FROM applications WHERE id = ? AND organizationId = ?',
    [id, organizationId]
  );
}

module.exports = {
  findAllByOrg,
  findOneByOrg,
  create,
  update,
  updateStatus,
  remove,
  VALID_STATUSES,
};
