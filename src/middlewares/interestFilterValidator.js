import { body, param, validationResult } from 'express-validator';
import { ValidationError } from '../utils/customErrors.js';

// Validation middleware for InterestFilterModel
export const validateInterestFilter = [
  // Validate 'name' field
  body('userId')
    .exists({ checkNull: true })
    .withMessage('userId is required'),

  // Middleware to handle validation errors
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError('Validation failed', errors.array());
      }
      next();
    } catch (error) {
      res.sendError(new ValidationError('An error occurred while validating', [error]));
      return;
    }
  },
];
