import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../src/app.js';
import InterestFilter from '../../src/models/interestFilterModel.js';
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import config from '../../src/config.js';

const exampleInterestFilter = {
    userId: 'user1',
    categoryList: ['NATURE', 'CULTURE']
};

const example2InterestFilter = {
  userId: 'newUser',
  categoryList: ['NATURE', 'CULTURE']
};

const user1payload = {
    user: {
        userId: "user1",
        roles: ['admin', 'user'],
        plan: 'pro',
        addons: ['all'],
        name: 'John Doe',
        verifiedEmail: true,
    }
};

const token1 = jwt.sign(user1payload, config.jwtSecret, { expiresIn: '1h' });

describe('[Integration][Component] InterestFilter Tests', () => {
    let interestFilterId;
    let mongoServer;

    beforeAll(async () => {
        config.infrastructureIntegration = false; 
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
        await mongoose.connect(mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
      });
    
      afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
        vi.restoreAllMocks();
      });

    beforeEach(async () => {
        const interestFilter = await InterestFilter.create(exampleInterestFilter);
        interestFilterId = interestFilter._id.toString();
    });

    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
    });

    it('[+] should ADD an interestFilter', async () => {
        const response = await request(app)
            .post('/api/v1/interestFilter')
            .set('Authorization', `Bearer ${token1}`)
            .send(example2InterestFilter);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('userId', 'newUser');
    });

    it('[+] should GET an interestFilter by userId', async () => {
        const response = await request(app)
            .get(`/api/v1/interestFilter/${exampleInterestFilter.userId}`)
            .set('Authorization', `Bearer ${token1}`);
        expect(response.status).toBe(200);
        expect(response.body.data.userId).toBe(exampleInterestFilter.userId);
        expect(response.body.data).toHaveProperty('categoryList', ['NATURE', 'CULTURE']);
    });

    it('[+] should UPDATE an interestFilter by userId', async () => {
        const updatedInterestFilter = { categoryList: ['CITY', 'ADVENTURE'] };
        const response = await request(app)
            .put(`/api/v1/interestFilter/${exampleInterestFilter.userId}`)
            .set('Authorization', `Bearer ${token1}`)
            .send(updatedInterestFilter);
        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('categoryList', ['CITY', 'ADVENTURE']);
    });

    it('[+] should DELETE an interestFilter by ID', async () => {
        const response = await request(app)
            .delete(`/api/v1/interestFilter/${interestFilterId}`)
            .set('Authorization', `Bearer ${token1}`);
        expect(response.status).toBe(204);

        const dbInterestFilter = await InterestFilter.findById(interestFilterId);
        expect(dbInterestFilter).toBeNull();
    });

    // Auth tests
    it('[-] [Auth] POST should return 401 if no token is provided', async () => {
        const response = await request(app)
            .post('/api/v1/interestFilter')
            .send(exampleInterestFilter);
        expect(response.status).toBe(401);
    });

    it('[-] [Auth] PUT should return 401 if no token is provided', async () => {
        const response = await request(app)
            .put(`/api/v1/interestFilter/${exampleInterestFilter.userId}`)
            .send(exampleInterestFilter);
        expect(response.status).toBe(401);
    });

    it('[-] [Auth] DELETE should return 401 if no token is provided', async () => {
        const response = await request(app)
            .delete(`/api/v1/interestFilter/${interestFilterId}`);
        expect(response.status).toBe(401);
    });

    // Validation tests
    it('[-] [Validation] POST should return 400 if userId is missing', async () => {
        const invalidInterestFilter = { ...exampleInterestFilter, userId: null };
        const response = await request(app)
            .post('/api/v1/interestFilter')
            .set('Authorization', `Bearer ${token1}`)
            .send(invalidInterestFilter);
        expect(response.status).toBe(400);
        expect(response.body.appCode).toBe('VALIDATION_ERROR');
    });

    it('[-] [Validation] POST should return 400 if categoryList is missing', async () => {
        const invalidInterestFilter = { ...exampleInterestFilter, categoryList: null };
        const response = await request(app)
            .post('/api/v1/interestFilter')
            .set('Authorization', `Bearer ${token1}`)
            .send(invalidInterestFilter);
        expect(response.status).toBe(400);
        expect(response.body.appCode).toBe('VALIDATION_ERROR');
    });

    it('[-] [Validation] PUT should return 400 if categoryList is missing', async () => {
        const invalidInterestFilter = { ...exampleInterestFilter, categoryList: null };
        const response = await request(app)
            .put(`/api/v1/interestFilter/${exampleInterestFilter.userId}`)
            .set('Authorization', `Bearer ${token1}`)
            .send(invalidInterestFilter);
        expect(response.status).toBe(400);
        expect(response.body.appCode).toBe('VALIDATION_ERROR');
    });

    // Rate limiting tests
    it('[-] should return 429 if too many requests are made', async () => {
        for (let i = 0; i < 101; i++) {
            await request(app)
                .get(`/api/v1/interestFilter/${exampleInterestFilter.userId}`)
                .set('Authorization', `Bearer ${token1}`);
        }
        const response = await request(app)
            .get(`/api/v1/interestFilter/${exampleInterestFilter.userId}`)
            .set('Authorization', `Bearer ${token1}`);
        expect(response.status).toBe(429);
        expect(response.body).toHaveProperty('appCode', 'TOO_MANY_REQUESTS');
    });
});
