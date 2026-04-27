const express = require('express');
const controller = require('../controllers/stats.controller');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', auth, controller.dashboard);

module.exports = router;
