const { body } = require('express-validator');

const SENIORITIES = ['junior', 'mid', 'senior'];

const createValidator = [
  body('name').notEmpty().withMessage('El nombre es obligatorio').trim(),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email inválido'),
  body('phone').optional({ checkFalsy: true }).trim(),
  body('seniority').optional().isIn(SENIORITIES).withMessage('Seniority inválido'),
  body('skills').optional().isArray().withMessage('skills debe ser un array'),
  body('skills.*').optional().isString().trim(),
  body('linkedinUrl').optional({ checkFalsy: true }).isURL().withMessage('URL no válida'),
  body('notes').optional({ checkFalsy: true }).isString(),
];

const updateValidator = [
  body('name').optional().trim().notEmpty().withMessage('Nombre vacío'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email inválido'),
  body('phone').optional({ checkFalsy: true }).trim(),
  body('seniority').optional().isIn(SENIORITIES).withMessage('Seniority inválido'),
  body('skills').optional().isArray().withMessage('skills debe ser un array'),
  body('skills.*').optional().isString().trim(),
  body('linkedinUrl').optional({ checkFalsy: true }).isURL().withMessage('URL no válida'),
  body('notes').optional({ checkFalsy: true }).isString(),
];

module.exports = { createValidator, updateValidator };
