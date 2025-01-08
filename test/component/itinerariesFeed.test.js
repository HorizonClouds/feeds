import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../src/app.js';
import ItinerariesFeed from '../../src/models/itinerariesFeedModel.js';
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import config from '../../src/config.js';

const exampleItinerariesFeed = {
    userId: 'user1',
    creationDate: new Date('2023-10-01T12:00:00.000Z'),
    itineraryList: [{ name: 'Itinerary 1' }, { name: 'Itinerary 2' }],
};

const example2ItinerariesFeed = {
  userId: 'newUser',
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

describe('[Integration][Component] ItinerariesFeed Tests', () => {
  let itinerariesFeedId;
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
    const itinerariesFeed = await ItinerariesFeed.create(
      exampleItinerariesFeed
    );
    itinerariesFeedId = itinerariesFeed._id.toString();
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  it('[+] should ADD an itinerariesFeed', async () => {
    const response = await request(app)
      .post('/api/v1/itinerariesFeed')
      .set('Authorization', `Bearer ${token1}`)
      .send(example2ItinerariesFeed);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('userId', 'newUser');
  });

  it('[+] should GET an itinerariesFeed by userId', async () => {
    const response = await request(app)
      .get(`/api/v1/itinerariesFeed/${exampleItinerariesFeed.userId}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(response.status).toBe(200);
    expect(response.body.data.userId).toBe(exampleItinerariesFeed.userId);
    expect(response.body.data).toHaveProperty(
      'creationDate',
      '2023-10-01T12:00:00.000Z'
    );
  });

  it('[+] should UPDATE an itinerariesFeed by userId', async () => {
    const response = await request(app)
      .put(`/api/v1/itinerariesFeed/${exampleItinerariesFeed.userId}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('itineraryList', []);
  });

  // Auth tests
  it('[-] [Auth] POST should return 401 if no token is provided', async () => {
    const response = await request(app)
      .post('/api/v1/itinerariesFeed')
      .send(exampleItinerariesFeed);
    expect(response.status).toBe(401);
  });

  it('[-] [Auth] PUT should return 401 if no token is provided', async () => {
    const response = await request(app)
      .put(`/api/v1/itinerariesFeed/${exampleItinerariesFeed.userId}`)
      .send(exampleItinerariesFeed);
    expect(response.status).toBe(401);
  });

  // Validation tests
  it('[-] [Validation] POST should return 400 if userId is missing', async () => {
    const invalidItinerariesFeed = { ...exampleItinerariesFeed, userId: null };
    const response = await request(app)
      .post('/api/v1/itinerariesFeed')
      .set('Authorization', `Bearer ${token1}`)
      .send(invalidItinerariesFeed);
    expect(response.status).toBe(400);
    expect(response.body.appCode).toBe('VALIDATION_ERROR');
  });

  it('[-] [Validation] POST should return 400 if creationDate is missing', async () => {
    const invalidItinerariesFeed = {
      ...exampleItinerariesFeed,
      creationDate: null,
    };
    const response = await request(app)
      .post('/api/v1/itinerariesFeed')
      .set('Authorization', `Bearer ${token1}`)
      .send(invalidItinerariesFeed);
    expect(response.status).toBe(400);
    expect(response.body.appCode).toBe('VALIDATION_ERROR');
  });

  // Rate limiting tests
  it('[-] should return 429 if too many requests are made', async () => {
    for (let i = 0; i < 101; i++) {
        await request(app)
            .get(`/api/v1/itinerariesFeed/${exampleItinerariesFeed.userId}`)
            .set('Authorization', `Bearer ${token1}`);
    }
    const response = await request(app)
        .get(`/api/v1/itinerariesFeed/${exampleItinerariesFeed.userId}`)
        .set('Authorization', `Bearer ${token1}`);
    expect(response.status).toBe(429);
    expect(response.body).toHaveProperty('appCode', 'TOO_MANY_REQUESTS');
  });
});
