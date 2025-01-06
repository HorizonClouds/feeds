import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import ItinerariesFeedModel from '../../src/models/itinerariesFeedModel.js';
import * as itinerariesFeedService from '../../src/services/itinerariesFeedService.js';
import { ValidationError, NotFoundError } from '../../src/utils/customErrors.js';
import config from '../../src/config.js';

const exampleItinerariesFeed = {
  userId: 'user1',
  creationDate: new Date(),
  itineraryList: [{ name: 'Itinerary 1' }, { name: 'Itinerary 2' }],
};

describe('(Integration) ItinerariesFeed Service Tests', () => {
  let mongoServer;

  beforeAll(async () => {
    config.infrastructureIntegration = false;
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    if (mongoose.connection.readyState !== 0) 
              await mongoose.disconnect();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await ItinerariesFeedModel.deleteMany({});
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  describe('[+] Valid Operations', () => {
    it('should CREATE an itineraries feed', async () => {
      const result = await itinerariesFeedService.createItinerariesFeed(exampleItinerariesFeed.userId);
      expect(result).toHaveProperty('userId', 'user1');
      expect(result).toHaveProperty('itineraryList');
      expect(result.itineraryList).toHaveLength(0);
    });

    it('should GET an itineraries feed by userId', async () => {
      const itinerariesFeed = new ItinerariesFeedModel(exampleItinerariesFeed);
      await itinerariesFeed.save();
      const result = await itinerariesFeedService.getItinerariesFeedByUserId('user1');
      expect(result).toHaveProperty('userId', 'user1');
      expect(result).toHaveProperty('itineraryList');
      expect(result.itineraryList).toHaveLength(2);
    });

    it('should UPDATE an itineraries feed', async () => {
      const itinerariesFeed = new ItinerariesFeedModel(exampleItinerariesFeed);
      await itinerariesFeed.save();
      const result = await itinerariesFeedService.updateItinerariesFeed(itinerariesFeed.userId);
      expect(result).toHaveProperty('itineraryList');
      expect(result.itineraryList).toHaveLength(0);
    });
  });

  describe('[-] Invalid Operations', () => {
    it('should NOT CREATE an itineraries feed with missing required field userId', async () => {
      const itinerariesFeed = { ...exampleItinerariesFeed, userId: '' };
      let error;
      try {
        await itinerariesFeedService.createItinerariesFeed(itinerariesFeed);
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should NOT CREATE an itineraries feed with invalid itineraryList', async () => {
      const itinerariesFeed = { ...exampleItinerariesFeed, itineraryList: 'INVALID' };
      let error;
      try {
        await itinerariesFeedService.createItinerariesFeed(itinerariesFeed);
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should NOT GET a non-existent itineraries feed', async () => {
      let error;
      try {
        await itinerariesFeedService.getItinerariesFeedByUserId('nonexistentUserId');
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(NotFoundError);
    });

    it('should NOT UPDATE a non-existent itineraries feed', async () => {
      const updatedData = { itineraryList: [{ name: 'Updated Itinerary' }] };
      let error;
      try {
        await itinerariesFeedService.updateItinerariesFeed('nonexistentId', updatedData);
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(NotFoundError);
    });
  });
});
