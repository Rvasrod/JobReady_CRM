const service = require('../services/companies.service');

function fail(res, error) {
  res.status(error.status ?? 500).json({ message: error.message });
}

async function list(req, res) {
  try {
    const companies = await service.findAllByUser(req.user.id);
    res.json({ companies });
  } catch (error) {
    fail(res, error);
  }
}

async function detail(req, res) {
  try {
    const company = await service.findOneByUser(req.params.id, req.user.id);
    if (!company) return res.status(404).json({ message: 'Empresa no encontrada' });
    res.json({ company });
  } catch (error) {
    fail(res, error);
  }
}

async function create(req, res) {
  try {
    const company = await service.create(req.user.id, req.body);
    res.status(201).json({ message: 'Empresa creada', company });
  } catch (error) {
    fail(res, error);
  }
}

async function update(req, res) {
  try {
    const company = await service.update(req.params.id, req.user.id, req.body);
    res.json({ message: 'Empresa actualizada', company });
  } catch (error) {
    fail(res, error);
  }
}

async function remove(req, res) {
  try {
    await service.remove(req.params.id, req.user.id);
    res.json({ message: 'Empresa eliminada' });
  } catch (error) {
    fail(res, error);
  }
}

module.exports = { list, detail, create, update, remove };
