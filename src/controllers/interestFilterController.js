import interestFilterService from '../services/interestFilterService.js';

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

export const createInterestFilter = async (req, res, next) => {
  try {
    const newInterestFilter = await interestFilterService.createInterestFilter(req.body);
    logger.info(`Creating interestFilter with id: ${newInterestFilter._id}`)
    res.sendSuccess(
      removeMongoFields(newInterestFilter),
      'InterestFilter created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getInterestFilterByUserId = async (req, res, next) => {
  try {
    const interestFilter = await interestFilterService.getInterestFilterByUserId(req.params.userId);
    logger.info(`Getting interestFilter with id: ${interestFilter._id}`)
    res.sendSuccess(removeMongoFields(interestFilter));
  } catch (error) {
    next(error);
  }
};

export const updateInterestFilter = async (req, res, next) => {
  try {
    let data = req.body;
    // remove _id field from data
    delete data._id;
    const updatedInterestFilter = await interestFilterService.updateInterestFilter(
      req.params.id,
      data
    );
    logger.info(`Updating interestFilter with id: ${updatedInterestFilter._id}`)
    res.sendSuccess(
      removeMongoFields(updatedInterestFilter),
      'InterestFilter updated successfully'
    );
  } catch (error) {
    next(error);
  }
};
