import interestFilterService from '../services/interestFilterService.js';
import { NotFoundError, ValidationError } from '../utils/customErrors.js';

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
  console.log("HOLA")
  try {
    const newInterestFilter = await interestFilterService.createInterestFilter(req.body);
    res.sendSuccess(
      removeMongoFields(newInterestFilter),
      'InterestFilter created successfully',
      201
    );
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.sendError(new ValidationError('Validation failed', error.errors));
    } else {
      res.sendError(
        new ValidationError('An error occurred while creating the InterestFilter', [
          { msg: error.message },
        ])
      );
    }
  }
};

export const getInterestFilterByUserId = async (req, res, next) => {
  try {
    const interestFilter = await interestFilterService.getInterestFilterByUserId(req.params.userId);
    if (!interestFilter) throw new NotFoundError('InterestFilter not found');
    res.sendSuccess(removeMongoFields(interestFilter));
  } catch (error) {
    res.sendError(error);
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
    if (!updatedInterestFilter) throw new NotFoundError('InterestFilter not found');
    res.sendSuccess(
      removeMongoFields(updatedInterestFilter),
      'InterestFilter updated successfully'
    );
  } catch (error) {
    res.sendError(error);
  }
};
