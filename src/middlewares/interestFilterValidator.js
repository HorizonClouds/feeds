import { body, validationResult } from 'express-validator';
import { ValidationError } from '../utils/customErrors.js';

// Validation middleware for InterestFilterModel
export const validateCreateInterestFilter = [
  body('categoryList')
    .isArray()
    .withMessage('categoryList must be an array')
    .custom((categoryList) => {
      // Valores permitidos
      const allowedValues = ['NATURE', 'CITY', 'CULTURE', 'ADVENTURE', 'RELAX'];
      // Verificar que todos los elementos sean válidos
      const isValid = categoryList.every((item) => allowedValues.includes(item));
      if (!isValid) {
        throw new Error(
          `categoryList contains invalid values. Allowed values are: ${allowedValues.join(', ')}`
        );
      }
      return true;
    }),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(new ValidationError('Error found in request body when trying to create interestFilter', errors.array()));
    }
    next();
  },
];

export const validateUpdateInterestFilter = [
  body('userId')
    .not()
    .exists()
    .withMessage('userId should not be provided'),
  
  body('categoryList')
    .isArray()
    .withMessage('categoryList must be an array')
    .custom((categoryList) => {
      // Valores permitidos
      const allowedValues = ['NATURE', 'CITY', 'CULTURE', 'ADVENTURE', 'RELAX'];
      // Verificar que todos los elementos sean válidos
      const isValid = categoryList.every((item) => allowedValues.includes(item));
      if (!isValid) {
        throw new Error(
          `categoryList contains invalid values. Allowed values are: ${allowedValues.join(', ')}`
        );
      }
      return true;
    }),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(new ValidationError('Error found in request body when trying to update interestFilter', errors.array()));
    }
    next();
  },
];