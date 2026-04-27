const service = require('../services/applications.service');
const eventsService = require('../services/application-events.service');

const STATUS_EVENT_MAP = {
  applied: 'status_changed',
  cv_review: 'status_changed',
  interview: 'status_changed',
  technical_test: 'status_changed',
  offer: 'offer_sent',
  hired: 'offer_accepted',
  rejected: 'rejected',
};

function fail(res, error) {
  res.status(error.status ?? 500).json({ success: false, message: error.message });
}

async function list(req, res) {
  try {
    const applications = await service.findAllByOrg(req.user.organizationId);
    res.json({ success: true, data: applications });
  } catch (error) { fail(res, error); }
}

async function detail(req, res) {
  try {
    const application = await service.findOneByOrg(req.params.id, req.user.organizationId);
    if (!application) return res.status(404).json({ success: false, message: 'Aplicación no encontrada' });
    res.json({ success: true, data: application });
  } catch (error) { fail(res, error); }
}

async function create(req, res) {
  try {
    const application = await service.create(req.user.organizationId, req.body);
    res.status(201).json({ success: true, data: application });
  } catch (error) { fail(res, error); }
}

async function update(req, res) {
  try {
    const application = await service.update(req.params.id, req.user.organizationId, req.body);
    res.json({ success: true, data: application });
  } catch (error) { fail(res, error); }
}

async function updateStatus(req, res) {
  try {
    const previousApp = await service.findOneByOrg(req.params.id, req.user.organizationId);
    if (!previousApp) return res.status(404).json({ success: false, message: 'Aplicación no encontrada' });

    const application = await service.updateStatus(
      req.params.id,
      req.user.organizationId,
      req.body.status
    );

    const eventType = STATUS_EVENT_MAP[req.body.status] || 'status_changed';
    await eventsService.create(
      req.params.id,
      req.user.id,
      eventType,
      `Cambiado a ${req.body.status}`
    );

    res.json({ success: true, data: application });
  } catch (error) { fail(res, error); }
}

async function getEvents(req, res) {
  try {
    const application = await service.findOneByOrg(req.params.id, req.user.organizationId);
    if (!application) return res.status(404).json({ success: false, message: 'Aplicación no encontrada' });

    const events = await eventsService.findByApplication(req.params.id, req.user.organizationId);
    res.json({ success: true, data: events });
  } catch (error) { fail(res, error); }
}

async function remove(req, res) {
  try {
    await service.remove(req.params.id, req.user.organizationId);
    res.json({ success: true });
  } catch (error) { fail(res, error); }
}

module.exports = { list, detail, create, update, updateStatus, remove, getEvents };