import InterestFilterModel from '../models/interestFilterModel.js';
import { NotFoundError, BadRequestError } from '../utils/customErrors.js';

export const createInterestFilter = async (data) => {
  try {
    const newInterestFilter = new InterestFilterModel(data);
    return await newInterestFilter.save();
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      throw new ValidationError('Validation failed', error.errors);
    }
    throw new BadRequestError('Error creating InterestFilter', error);
  }
};


export const getInterestFilterByUserId = async (userId) => {
  try {
    const interestFilter = await InterestFilterModel.findOne({ userId: userId });
    if (!interestFilter) {
      throw new NotFoundError('InterestFilter not found');
    }
    return interestFilter;
  } catch (error) {
    throw new NotFoundError('Error fetching InterestFilter by userId', error);
  }
};

export const updateInterestFilter = async (id, data) => {
  try {
    const updatedInterestFilter = await InterestFilterModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!updatedInterestFilter) {
      throw new NotFoundError('InterestFilter not found');
    }
    return updatedInterestFilter;
  } catch (error) {
    throw new NotFoundError('Error updating InterestFilter', error);
  }
};

export default {
  createInterestFilter,
  getInterestFilterByUserId,
  updateInterestFilter,
};
