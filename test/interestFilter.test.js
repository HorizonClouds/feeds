import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import InterestFilterModel from '../src/models/interestFilterModel.js';
import * as interestFilterService from '../src/services/interestFilterService.js';
import { ValidationError, NotFoundError } from '../src/utils/customErrors.js';

const exampleInterestFilter = {
  userId: 'user1',
  categoryList: ['NATURE', 'CITY'],
};

describe('(Integration) InterestFilter Service Tests', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await InterestFilterModel.deleteMany({});
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  describe('[+] Valid Operations', () => {
    it('should CREATE an interest filter', async () => {
      const interestFilter = exampleInterestFilter;
      const result =
        await interestFilterService.createInterestFilter(interestFilter);
      expect(result).toHaveProperty('userId', 'user1');
      expect(result).toHaveProperty('categoryList', ['NATURE', 'CITY']);
    });

    it('should GET an interest filter by userId', async () => {
      const interestFilter = new InterestFilterModel(exampleInterestFilter);
      await interestFilter.save();
      const result =
        await interestFilterService.getInterestFilterByUserId('user1');
      expect(result).toHaveProperty('userId', 'user1');
      expect(result).toHaveProperty('categoryList', ['NATURE', 'CITY']);
    });

    it('should UPDATE an interest filter', async () => {
      const interestFilter = new InterestFilterModel(exampleInterestFilter);
      await interestFilter.save();
      const updatedData = { categoryList: ['CULTURE', 'ADVENTURE'] };
      const result = await interestFilterService.updateInterestFilter(
        interestFilter._id,
        updatedData
      );
      expect(result).toHaveProperty('categoryList', ['CULTURE', 'ADVENTURE']);
    });

    it('should DELETE an interest filter', async () => {
      const interestFilter = new InterestFilterModel(exampleInterestFilter);
      await interestFilter.save();
      const result = await interestFilterService.deleteInterestFilter(
        interestFilter._id
      );
      expect(result).toHaveProperty('userId', 'user1');
    });
  });

  describe('[-] Invalid Operations', () => {
    it('should NOT CREATE an interest filter with missing required field userId', async () => {
      const interestFilter = { ...exampleInterestFilter, userId: '' };
      let error;
      try {
        await interestFilterService.createInterestFilter(interestFilter);
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should NOT CREATE an interest filter with invalid categoryList', async () => {
        const interestFilter = { ...exampleInterestFilter, categoryList: 'INVALID' };
        let error;
        try {
          await interestFilterService.createInterestFilter(interestFilter);
        } catch (e) {
          error = e;
        }
        expect(error).toBeInstanceOf(ValidationError);
      });

    it('should NOT GET a non-existent interest filter', async () => {
      let error;
      try {
        await interestFilterService.getInterestFilterByUserId(
          'nonexistentUserId'
        );
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(NotFoundError);
    });

    it('should NOT UPDATE a non-existent interest filter', async () => {
      const updatedData = { categoryList: ['CULTURE', 'ADVENTURE'] };
      let error;
      try {
        await interestFilterService.updateInterestFilter(
          'nonexistentId',
          updatedData
        );
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(NotFoundError);
    });

    it('should NOT UPDATE an interest filter with invalid categoryList', async () => {
      const interestFilter = new InterestFilterModel(exampleInterestFilter);
      await interestFilter.save();
      const updatedData = { categoryList: 'INVALID' };
      let error;
      try {
        await interestFilterService.updateInterestFilter(
          interestFilter._id,
          updatedData
        );
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should NOT DELETE a non-existent interest filter', async () => {
      let error;
      try {
        await interestFilterService.deleteInterestFilter('nonexistentId');
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(NotFoundError);
    });
  });
});
