const service = require('../services/applications.service');

function fail(res, error) {
  res.status(error.status ?? 500).json({ message: error.message });
}

async function list(req, res) {
  try {
    const applications = await service.findAllByOrg(req.user.organizationId);
    res.json({ applications });
  } catch (error) { fail(res, error); }
}

async function detail(req, res) {
  try {
    const application = await service.findOneByOrg(req.params.id, req.user.organizationId);
    if (!application) return res.status(404).json({ message: 'Aplicación no encontrada' });
    res.json({ application });
  } catch (error) { fail(res, error); }
}

async function create(req, res) {
  try {
    const application = await service.create(req.user.organizationId, req.body);
    res.status(201).json({ message: 'Aplicación creada', application });
  } catch (error) { fail(res, error); }
}

async function update(req, res) {
  try {
    const application = await service.update(req.params.id, req.user.organizationId, req.body);
    res.json({ message: 'Aplicación actualizada', application });
  } catch (error) { fail(res, error); }
}

async function updateStatus(req, res) {
  try {
    const application = await service.updateStatus(
      req.params.id,
      req.user.organizationId,
      req.body.status
    );
    res.json({ message: 'Estado actualizado', application });
  } catch (error) { fail(res, error); }
}

async function remove(req, res) {
  try {
    await service.remove(req.params.id, req.user.organizationId);
    res.json({ message: 'Aplicación eliminada' });
  } catch (error) { fail(res, error); }
}

module.exports = { list, detail, create, update, updateStatus, remove };
