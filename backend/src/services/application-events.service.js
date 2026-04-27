const pool = require('../db/connection');

const EVENT_TYPE_LABELS = {
  status_changed: 'Estado cambiado',
  note_added: 'Nota añadida',
  interview_scheduled: 'Entrevista programada',
  offer_sent: 'Oferta enviada',
  offer_accepted: 'Oferta aceptada',
  offer_rejected: 'Oferta rechazada',
  rejected: 'Candidato rechazado',
};

async function findByApplication(applicationId, organizationId) {
  const [rows] = await pool.execute(
    `SELECT e.*, u.name as userName 
     FROM application_events e
     JOIN users u ON u.id = e.userId
     WHERE e.applicationId = ? 
     ORDER BY e.createdAt DESC`,
    [applicationId]
  );
  return rows;
}

async function create(applicationId, userId, eventType, description) {
  const [result] = await pool.execute(
    `INSERT INTO application_events (applicationId, userId, eventType, description)
     VALUES (?, ?, ?, ?)`,
    [applicationId, userId, eventType, description ?? null]
  );
  return { id: result.insertId, eventType, description, createdAt: new Date() };
}

module.exports = { findByApplication, create, EVENT_TYPE_LABELS };