const service = require('../services/positions.service');

function fail(res, error) {
  res.status(error.status ?? 500).json({ success: false, message: error.message });
}

async function list(req, res) {
  try {
    const positions = await service.findAllByOrg(req.user.organizationId);
    res.json({ success: true, data: positions });
  } catch (error) { fail(res, error); }
}

async function detail(req, res) {
  try {
    const position = await service.findOneByOrg(req.params.id, req.user.organizationId);
    if (!position) return res.status(404).json({ success: false, message: 'Posición no encontrada' });
    res.json({ success: true, data: position });
  } catch (error) { fail(res, error); }
}

async function create(req, res) {
  try {
    const position = await service.create(req.user.organizationId, req.user.id, req.body);
    res.status(201).json({ success: true, data: position });
  } catch (error) { fail(res, error); }
}

async function update(req, res) {
  try {
    const position = await service.update(req.params.id, req.user.organizationId, req.body);
    res.json({ success: true, data: position });
  } catch (error) { fail(res, error); }
}

async function remove(req, res) {
  try {
    await service.remove(req.params.id, req.user.organizationId);
    res.json({ success: true });
  } catch (error) { fail(res, error); }
}

module.exports = { list, detail, create, update, remove };