import express from 'express';
import * as interestFilterController from '../controllers/interestFilterController.js';
import * as validateInterestValidator from '../middlewares/interestFilterValidator.js';
import { checkAuth, checkPlan, checkRole, checkAddon } from '../middlewares/authMiddelwares.js';

const router = express.Router();

// Define routes
router.post('/interestFilter', checkAuth(), validateInterestValidator.validateCreateInterestFilter, interestFilterController.createInterestFilter);
router.get('/interestFilter/:userId', checkAuth(), interestFilterController.getInterestFilterByUserId);
router.put('/interestFilter/:userId', checkAuth(), validateInterestValidator.validateUpdateInterestFilter,interestFilterController.updateInterestFilterByUserId);
router.delete('/interestFilter/:id', checkAuth(), interestFilterController.deleteInterestFilter);

export default router;
