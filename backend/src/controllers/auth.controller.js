const authService = require('../services/auth.service');

async function register(req, res) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    res
      .status(error.status ?? 500)
      .json({ success: false, message: error.message });
  }
}

async function login(req, res) {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    res
      .status(error.status ?? 500)
      .json({ success: false, message: error.message });
  }
}

async function me(req, res) {
  try {
    const user = await authService.getProfile(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    res
      .status(error.status ?? 500)
      .json({ success: false, message: error.message });
  }
}

module.exports = { register, login, me };
