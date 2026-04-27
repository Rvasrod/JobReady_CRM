const pool = require('../db/connection');

const PIPELINE_STAGES = [
  'applied', 'cv_review', 'interview', 'technical_test', 'offer',
];

function parseSkills(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return []; }
  }
  return [];
}

async function getDashboard(organizationId) {
  const [[{ activeCandidates }]] = await pool.execute(
    `SELECT COUNT(DISTINCT a.candidateId) AS activeCandidates
       FROM applications a
      WHERE a.organizationId = ?
        AND a.status NOT IN ('hired', 'rejected')`,
    [organizationId]
  );

  const [[{ openPositions }]] = await pool.execute(
    `SELECT COUNT(*) AS openPositions
       FROM positions
      WHERE organizationId = ? AND status = 'open'`,
    [organizationId]
  );

  const [[{ offersOut }]] = await pool.execute(
    `SELECT COUNT(*) AS offersOut
       FROM applications
      WHERE organizationId = ? AND status = 'offer'`,
    [organizationId]
  );

  const [[{ hiredThisMonth }]] = await pool.execute(
    `SELECT COUNT(*) AS hiredThisMonth
       FROM applications
      WHERE organizationId = ?
        AND status = 'hired'
        AND YEAR(updatedAt)  = YEAR(CURRENT_DATE())
        AND MONTH(updatedAt) = MONTH(CURRENT_DATE())`,
    [organizationId]
  );

  const [pipelineRows] = await pool.execute(
    `SELECT a.id, a.status, a.updatedAt,
            c.id AS candidateId, c.name AS candidateName,
            c.seniority, c.skills,
            p.title AS positionTitle
       FROM applications a
       JOIN candidates c ON c.id = a.candidateId
       JOIN positions  p ON p.id = a.positionId
      WHERE a.organizationId = ?
        AND a.status NOT IN ('hired', 'rejected')
      ORDER BY a.updatedAt DESC`,
    [organizationId]
  );

  const pipeline = PIPELINE_STAGES.map((stage) => {
    const stageRows = pipelineRows.filter((r) => r.status === stage);
    return {
      status: stage,
      count: stageRows.length,
      items: stageRows.slice(0, 5).map((r) => ({
        id: r.id,
        candidateId: r.candidateId,
        candidateName: r.candidateName,
        seniority: r.seniority,
        skills: parseSkills(r.skills),
        positionTitle: r.positionTitle,
      })),
    };
  });

  const [recent] = await pool.execute(
    `SELECT a.id, a.status, a.updatedAt,
            c.name AS candidateName, c.seniority,
            p.title AS positionTitle
       FROM applications a
       JOIN candidates c ON c.id = a.candidateId
       JOIN positions  p ON p.id = a.positionId
      WHERE a.organizationId = ?
      ORDER BY a.updatedAt DESC
      LIMIT 10`,
    [organizationId]
  );

  const [[{ totalApplications }]] = await pool.execute(
    `SELECT COUNT(*) AS totalApplications FROM applications WHERE organizationId = ?`,
    [organizationId]
  );

  const [[{ totalHired }]] = await pool.execute(
    `SELECT COUNT(*) AS totalHired FROM applications WHERE organizationId = ? AND status = 'hired'`,
    [organizationId]
  );

  const [[{ totalRejected }]] = await pool.execute(
    `SELECT COUNT(*) AS totalRejected FROM applications WHERE organizationId = ? AND status = 'rejected'`,
    [organizationId]
  );

  const conversionRate = totalApplications > 0 
    ? Math.round((totalHired / totalApplications) * 100) 
    : 0;

  const [[{ avgDaysToHire }]] = await pool.execute(
    `SELECT AVG(DATEDIFF(updatedAt, createdAt)) AS avgDaysToHire
       FROM applications
      WHERE organizationId = ? AND status = 'hired'`,
    [organizationId]
  );

  return {
    activeCandidates,
    openPositions,
    offersOut,
    hiredThisMonth,
    totalApplications,
    totalHired,
    totalRejected,
    conversionRate,
    avgDaysToHire: Math.round(avgDaysToHire || 0),
    pipeline,
    recent: recent.map(r => ({
      id: r.id,
      status: r.status,
      updatedAt: r.updatedAt,
      candidateName: r.candidateName,
      seniority: r.seniority,
      positionTitle: r.positionTitle,
    })),
  };
}

module.exports = { getDashboard, PIPELINE_STAGES };
