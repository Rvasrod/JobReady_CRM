const { body } = require('express-validator');

const STATUSES = [
  'applied', 'cv_review', 'interview', 'technical_test', 'offer', 'hired', 'rejected',
];

const createValidator = [
  body('candidateId').isInt({ min: 1 }).withMessage('candidateId requerido'),
  body('positionId').isInt({ min: 1 }).withMessage('positionId requerido'),
  body('status').optional().isIn(STATUSES).withMessage('Status inválido'),
  body('appliedAt').optional({ checkFalsy: true }).isISO8601().withMessage('Fecha inválida'),
  body('notes').optional({ checkFalsy: true }).isString(),
];

const updateValidator = [
  body('status').optional().isIn(STATUSES).withMessage('Status inválido'),
  body('appliedAt').optional({ checkFalsy: true }).isISO8601().withMessage('Fecha inválida'),
  body('notes').optional({ checkFalsy: true }).isString(),
];

const statusValidator = [
  body('status').isIn(STATUSES).withMessage('Status inválido'),
];

module.exports = { createValidator, updateValidator, statusValidator };
