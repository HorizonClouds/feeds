import InterestFilterModel from '../models/interestFilterModel.js';
import { NotFoundError, ValidationError } from '../utils/customErrors.js';

export const createInterestFilter = async (data) => {
  let newInterestFilter;
  try {
    newInterestFilter = new InterestFilterModel(data);
    await newInterestFilter.validate();
  } catch (error) {
    throw new ValidationError('Mongoose validation exception while creating interestFilter', error);
  }
  try {
    const existingInterestFilterForUserId = await InterestFilterModel.findOne({userId: data.userId});
    if(existingInterestFilterForUserId)
      throw new Error()
  } catch (error) {
    throw new ValidationError(`Invalid interestFilter creation, due to existing interestFilter for userId: ${data.userId}`, error)
  }

  return await newInterestFilter.save();
};

export const getInterestFilterByUserId = async (userId) => {
  try {
    const interestFilter = await InterestFilterModel.findOne({ userId: userId });
    if(!interestFilter)
      throw new Error()
    return interestFilter;
  } catch (error) {
    throw new NotFoundError(`InterestFilter with userId: ${userId} not found while getting`, error);
  }
};

export const updateInterestFilter = async (id, data) => {
  try {
    const existingInterestFilterForUserId = await InterestFilterModel.findOne({_id: id});
    if(!existingInterestFilterForUserId)
      throw new Error()
  } catch (error) {
    throw new NotFoundError(`InterestFilter with id: ${id} not found while updating`, error);
  }
  try {
    const updatedInterestFilter = await InterestFilterModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    return updatedInterestFilter;
  } catch (error) {
    throw new ValidationError(`InterestFilter with id: ${id} not able to update`, error);
  }
};

export default {
  createInterestFilter,
  getInterestFilterByUserId,
  updateInterestFilter,
};
