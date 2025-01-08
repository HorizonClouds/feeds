import itinerariesFeedService from '../services/itinerariesFeedService.js';

const removeMongoFields = (data) => {
  if (Array.isArray(data)) {
    return data.map((item) => {
      const { __v, ...rest } = item.toObject();
      return rest;
    });
  } else {
    const { __v, ...rest } = data.toObject();
    return rest;
  }
};

export const createItinerariesFeed = async (req, res, next) => {
  try {
    const newItinerariesFeed = await itinerariesFeedService.createItinerariesFeed(req.body.userId);
    logger.info(`Creating itinerariesFeed with id: ${newItinerariesFeed._id}`);
    res.sendSuccess(
      removeMongoFields(newItinerariesFeed),
      'ItinerariesFeed created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getItinerariesFeedByUserId = async (req, res, next) => {
  try {
    let userId = req.params.userId;
    let itinerariesFeed;
    if (userId === "default") {
      itinerariesFeed = await itinerariesFeedService.getItinerariesFeedDefault();
    } else {
      itinerariesFeed = await itinerariesFeedService.getItinerariesFeedByUserId(req.params.userId);
    }
    logger.info(`Getting itinerariesFeed with id: ${itinerariesFeed._id}`);
    res.sendSuccess(removeMongoFields(itinerariesFeed));
  } catch (error) {
    next(error);
  }
}


export const updateItinerariesFeedByUserId = async (req, res, next) => {
  try {
    
    const updatedItinerariesFeed = await itinerariesFeedService.updateItinerariesFeed(req.params.userId);
    logger.info(`Updating itinerariesFeed with id: ${updatedItinerariesFeed._id}`);
    res.sendSuccess(
      removeMongoFields(updatedItinerariesFeed),
      'ItinerariesFeed updated successfully'
    );
  } catch (error) {
    next(error);
  }
}
