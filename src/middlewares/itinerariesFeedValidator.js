import { body, validationResult } from 'express-validator';
import { ValidationError } from '../utils/customErrors.js';

// Validation middleware for ItinerariesFeedModel
export const validateCreateItinerariesFeed = [
  body('userId')
    .exists({ checkNull: true })
    .withMessage('userId is required'),

  body('creationDate')
    .not()
    .exists()
    .withMessage('creationDate should not be provided'),

  body('itineraryList')
    .not()
    .exists()
    .withMessage('itineraryList should not be provided'),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(new ValidationError('Error found in request body when trying to create itinerariesFeed', errors.array()));
    }
    next();
  },
];
