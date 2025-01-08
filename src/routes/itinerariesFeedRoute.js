import express from 'express';
import * as itinerariesFeedController from '../controllers/itinerariesFeedController.js';
import * as validateItinerariesFeedValidator from '../middlewares/itinerariesFeedValidator.js';
import { checkAuth, checkPlan, checkRole, checkAddon } from '../middlewares/authMiddelwares.js';

const router = express.Router();

// Define routes
router.post('/itinerariesFeed', checkAuth(), validateItinerariesFeedValidator.validateCreateItinerariesFeed, itinerariesFeedController.createItinerariesFeed);
router.get('/itinerariesFeed/:userId', (req, res, next) => {
  if (req.params.userId !== "default") {
    return checkAuth()(req, res, next);
  }
  next();
}, itinerariesFeedController.getItinerariesFeedByUserId);
router.put('/itinerariesFeed/:userId', checkAuth(), itinerariesFeedController.updateItinerariesFeedByUserId);

export default router;
