const service = require('../services/stats.service');

async function dashboard(req, res) {
  try {
    const data = await service.getDashboard(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    res
      .status(error.status ?? 500)
      .json({ success: false, message: error.message });
  }
}

module.exports = { dashboard };
