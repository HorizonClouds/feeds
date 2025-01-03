import express from 'express';
import * as interestFilterController from '../controllers/interestFilterController.js';
import * as validateInterestValidator from '../middlewares/interestFilterValidator.js';

const router = express.Router();

// Define routes
router.post('/interestFilter', validateInterestValidator.validateCreateInterestFilter, interestFilterController.createInterestFilter);
router.get('/interestFilter/:userId', interestFilterController.getInterestFilterByUserId);
router.put('/interestFilter/:id', validateInterestValidator.validateUpdateInterestFilter,interestFilterController.updateInterestFilter);
router.delete('/interestFilter/:id', interestFilterController.deleteInterestFilter);

export default router;
