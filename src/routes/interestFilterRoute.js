import express from 'express';
import * as interestFilterController from '../controllers/interestFilterController.js';
import { validateInterestFilter } from '../middlewares/interestFilterValidator.js';

const router = express.Router();

// Define routes
router.post('/v1/interestFilter', validateInterestFilter, interestFilterController.createInterestFilter);
router.get('/v1/interestFilter/:userId', interestFilterController.getInterestFilterByUserId);
router.put(
  '/v1/interestFilter/:id',
  validateInterestFilter,
  interestFilterController.updateInterestFilter
);

export default router;
