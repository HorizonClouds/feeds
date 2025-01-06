import ItinerariesFeedModel from '../models/itinerariesFeedModel.js';
import InterestFilterModel from '../models/interestFilterModel.js';
import { NotFoundError, ValidationError } from '../utils/customErrors.js';
import { getItineraries } from './itinerariesService.js';
import { getInterestFilterByUserId, createInterestFilter } from './interestFilterService.js';

export const createItinerariesFeed = async (userId) => {
  try {
    const existingItinerariesFeedForUserId = await ItinerariesFeedModel.findOne({ userId: userId });
    if (existingItinerariesFeedForUserId) throw new Error();
  } catch (error) {
    throw new ValidationError(`Invalid itinerariesFeed creation, due to existing itinerariesFeed for userId: ${userId}`, error);
  }

  let prioritizedItineraries;

  try {
     prioritizedItineraries = await getPrioritizedItineraries(userId);
  } catch (error) {
    throw new NotFoundError(`Error getting prioritized itineraries for userId: ${userId} while creating ItinerariesFeed`, error);
  }

  let newItinerariesFeed;

  try {
    newItinerariesFeed = new ItinerariesFeedModel({
      userId: userId,
      creationDate: new Date(),
      itineraryList: prioritizedItineraries,
    });
    await newItinerariesFeed.validate();
  } catch (error) {
    throw new ValidationError('Mongoose validation exception while creating itinerariesFeed', error);
  }

  return await newItinerariesFeed.save();;
};

export const getPrioritizedItineraries = async (userId) => {
  const itinerariesResponse = await getItineraries();
  const itineraries = itinerariesResponse.data;

  const interestFilter = await getInterestFilterByUserId(userId);

  itineraries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const recentItineraries = itineraries.slice(0, 50);

  const prioritizedItineraries = recentItineraries.sort((a, b) => {
    const aMatches = interestFilter.categoryList.includes(a.category);
    const bMatches = interestFilter.categoryList.includes(b.category);
    return bMatches - aMatches;
  });
  return prioritizedItineraries;
};

export const getItinerariesFeedByUserId = async (userId) => {
  try {
    const itinerariesFeed = await ItinerariesFeedModel.findOne({ userId: userId });
    if (!itinerariesFeed)
      throw new Error();
    return itinerariesFeed;
  } catch (error) {
    throw new NotFoundError(`ItinerariesFeed with userId: ${userId} not found while getting`, error);
  }
};

export const getItinerariesFeedDefault = async () => {
  try {
    const itinerariesFeed = await ItinerariesFeedModel.findOne({ userId: "default" });
    if (itinerariesFeed)
        return await updateItinerariesFeed('default');

    if (await InterestFilterModel.findOne({ userId: 'default' }) === null)
      await createInterestFilter({ userId: 'default', categoryList: [] });
    const newItinerariesFeed = await createItinerariesFeed('default');
    if (!newItinerariesFeed) throw new Error();
    return newItinerariesFeed;
  } catch (error) {
    throw new NotFoundError(`Error getting default itineraries feed`, error);
  }
};

export const updateItinerariesFeed = async (userId) => {
  try {
    const existingItinerariesFeedForUserId = await ItinerariesFeedModel.findOne(
      { userId: userId }
    );
    if (!existingItinerariesFeedForUserId) throw new Error();
  } catch (error) {
    throw new NotFoundError(`ItinerariesFeed with userId: ${userId} not found while updating`, error);
  }

  let prioritizedItineraries;
  try {
    prioritizedItineraries = await getPrioritizedItineraries(userId);
  } catch (error) {
    throw new NotFoundError(`Error getting prioritized itineraries for userId: ${userId} while updating ItinerariesFeed`, error);
  }
  

  try {
    const updatedItinerariesFeed = await ItinerariesFeedModel.findOneAndUpdate({ userId: userId }, {
        itineraryList: prioritizedItineraries,
        creationDate: new Date(),
      }, {
        new: true,
        runValidators: true,
      });
    return updatedItinerariesFeed;
  } catch (error) {
    throw new ValidationError(`ItinerariesFeed with userId: ${userId} not able to update`, error);
  }
};

export default {
  createItinerariesFeed,
  getItinerariesFeedByUserId,
  getItinerariesFeedDefault,
  updateItinerariesFeed,
};
