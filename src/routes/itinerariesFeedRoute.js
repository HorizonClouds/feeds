import express from 'express';
import * as itinerariesFeedController from '../controllers/itinerariesFeedController.js';
import * as validateItinerariesFeedValidator from '../middlewares/itinerariesFeedValidator.js';
import { checkAuth, checkPlan, checkRole, checkAddon } from '../middlewares/authMiddelwares.js';

const router = express.Router();

// Define routes
router.post('/itinerariesFeed', checkAuth(), validateItinerariesFeedValidator.validateCreateItinerariesFeed, itinerariesFeedController.createItinerariesFeed);
router.get('/itinerariesFeed/:userId', checkAuth(), itinerariesFeedController.getItinerariesFeedByUserId);
router.put('/itinerariesFeed/:userId', checkAuth(), itinerariesFeedController.updateItinerariesFeedByUserId);

export default router;
