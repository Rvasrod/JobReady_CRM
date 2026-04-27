const { body } = require('express-validator');

const registerValidator = [
  body('name').trim().isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('organizationName')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage('El nombre de la organización debe tener al menos 2 caracteres'),
  body('inviteCode')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Código de invitación inválido'),
  body().custom((value) => {
    const hasName = !!(value.organizationName && String(value.organizationName).trim());
    const hasCode = !!(value.inviteCode && String(value.inviteCode).trim());
    if (hasName && hasCode) {
      throw new Error('Indica organizationName o inviteCode, no ambos');
    }
    if (!hasName && !hasCode) {
      throw new Error('Debes crear una organización (organizationName) o unirte con inviteCode');
    }
    return true;
  }),
];

const loginValidator = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
];

module.exports = { registerValidator, loginValidator };
