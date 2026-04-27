const express = require('express');
const controller = require('../controllers/positions.controller');
const { createValidator, updateValidator } = require('../validators/positions.validators');
const validate = require('../middleware/validate.middleware');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

router.use(auth);

router.get('/', controller.list);
router.get('/:id', controller.detail);
router.post('/', createValidator, validate, controller.create);
router.put('/:id', updateValidator, validate, controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
