const { body, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

const validateRegister = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters, alphanumeric and underscore only'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number')
];

const validateLogin = [
  body('identifier')
    .notEmpty()
    .withMessage('Username or email required'),
  body('password')
    .notEmpty()
    .withMessage('Password required')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = {};
    errors.array().forEach(error => {
      if (!details[error.path]) {
        details[error.path] = [];
      }
      details[error.path].push(error.msg);
    });
    
    return errorResponse(res, 'VALIDATION_ERROR', 'Invalid input data', details, 400);
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  handleValidationErrors
};