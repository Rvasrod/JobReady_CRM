const { body } = require('express-validator');

const SENIORITIES = ['junior', 'mid', 'senior'];
const STATUSES = ['open', 'paused', 'closed'];

const createValidator = [
  body('title').notEmpty().withMessage('El título es obligatorio').trim(),
  body('description').optional({ checkFalsy: true }).isString(),
  body('seniority').optional().isIn(SENIORITIES).withMessage('Seniority inválido'),
  body('status').optional().isIn(STATUSES).withMessage('Status inválido'),
];

const updateValidator = [
  body('title').optional().trim().notEmpty().withMessage('Título vacío'),
  body('description').optional({ checkFalsy: true }).isString(),
  body('seniority').optional().isIn(SENIORITIES).withMessage('Seniority inválido'),
  body('status').optional().isIn(STATUSES).withMessage('Status inválido'),
];

module.exports = { createValidator, updateValidator };
