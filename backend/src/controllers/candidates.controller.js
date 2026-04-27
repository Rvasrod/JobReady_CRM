const service = require('../services/candidates.service');

function fail(res, error) {
  res.status(error.status ?? 500).json({ message: error.message });
}

async function list(req, res) {
  try {
    const candidates = await service.findAllByOrg(req.user.organizationId);
    res.json({ candidates });
  } catch (error) { fail(res, error); }
}

async function detail(req, res) {
  try {
    const candidate = await service.findOneByOrg(req.params.id, req.user.organizationId);
    if (!candidate) return res.status(404).json({ message: 'Candidato no encontrado' });
    res.json({ candidate });
  } catch (error) { fail(res, error); }
}

async function create(req, res) {
  try {
    const candidate = await service.create(
      req.user.organizationId,
      req.user.id,
      req.body
    );
    res.status(201).json({ message: 'Candidato creado', candidate });
  } catch (error) { fail(res, error); }
}

async function update(req, res) {
  try {
    const candidate = await service.update(
      req.params.id,
      req.user.organizationId,
      req.body
    );
    res.json({ message: 'Candidato actualizado', candidate });
  } catch (error) { fail(res, error); }
}

async function remove(req, res) {
  try {
    await service.remove(req.params.id, req.user.organizationId);
    res.json({ message: 'Candidato eliminado' });
  } catch (error) { fail(res, error); }
}

module.exports = { list, detail, create, update, remove };
