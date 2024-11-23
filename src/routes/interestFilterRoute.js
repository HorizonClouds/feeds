import express from 'express';
import * as interestFilterController from '../controllers/interestFilterController.js';
import * as validateInterestValidator from '../middlewares/interestFilterValidator.js';

const router = express.Router();

// Define routes
router.post('/v1/interestFilter', validateInterestValidator.validateCreateInterestFilter, interestFilterController.createInterestFilter);
router.get('/v1/interestFilter/:userId', interestFilterController.getInterestFilterByUserId);
router.put('/v1/interestFilter/:id', validateInterestValidator.validateUpdateInterestFilter,interestFilterController.updateInterestFilter);

export default router;
