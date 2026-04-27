const service = require('../services/positions.service');

function fail(res, error) {
  res.status(error.status ?? 500).json({ message: error.message });
}

async function list(req, res) {
  try {
    const positions = await service.findAllByOrg(req.user.organizationId);
    res.json({ positions });
  } catch (error) { fail(res, error); }
}

async function detail(req, res) {
  try {
    const position = await service.findOneByOrg(req.params.id, req.user.organizationId);
    if (!position) return res.status(404).json({ message: 'Posición no encontrada' });
    res.json({ position });
  } catch (error) { fail(res, error); }
}

async function create(req, res) {
  try {
    const position = await service.create(req.user.organizationId, req.user.id, req.body);
    res.status(201).json({ message: 'Posición creada', position });
  } catch (error) { fail(res, error); }
}

async function update(req, res) {
  try {
    const position = await service.update(req.params.id, req.user.organizationId, req.body);
    res.json({ message: 'Posición actualizada', position });
  } catch (error) { fail(res, error); }
}

async function remove(req, res) {
  try {
    await service.remove(req.params.id, req.user.organizationId);
    res.json({ message: 'Posición eliminada' });
  } catch (error) { fail(res, error); }
}

module.exports = { list, detail, create, update, remove };
