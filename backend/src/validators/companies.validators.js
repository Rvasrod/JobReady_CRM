const { body } = require('express-validator');

const createValidator = [
  body('name').notEmpty().withMessage('El nombre es obligatorio').trim(),
  body('sector').optional({ checkFalsy: true }).trim(),
  body('website').optional({ checkFalsy: true }).isURL().withMessage('URL no válida'),
  body('rating').optional().isInt({ min: 0, max: 5 }).withMessage('Rating entre 0 y 5'),
];

const updateValidator = [
  body('name').optional().trim().notEmpty().withMessage('Nombre vacío'),
  body('sector').optional({ checkFalsy: true }).trim(),
  body('website').optional({ checkFalsy: true }).isURL().withMessage('URL no válida'),
  body('rating').optional().isInt({ min: 0, max: 5 }).withMessage('Rating entre 0 y 5'),
];

module.exports = { createValidator, updateValidator };
