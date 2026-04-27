const express = require('express');
const controller = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../validators/auth.validators');
const validate = require('../middleware/validate.middleware');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', registerValidator, validate, controller.register);
router.post('/login', loginValidator, validate, controller.login);
router.get('/me', auth, controller.me);

module.exports = router;
