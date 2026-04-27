const express = require('express');
const controller = require('../controllers/applications.controller');
const {
  createValidator,
  updateValidator,
  statusValidator,
} = require('../validators/applications.validators');
const validate = require('../middleware/validate.middleware');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

router.use(auth);

router.get('/', controller.list);
router.get('/:id', controller.detail);
router.get('/:id/events', controller.getEvents);
router.post('/', createValidator, validate, controller.create);
router.put('/:id', updateValidator, validate, controller.update);
router.patch('/:id/status', statusValidator, validate, controller.updateStatus);
router.delete('/:id', controller.remove);

module.exports = router;
