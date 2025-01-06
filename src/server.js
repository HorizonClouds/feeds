// server.js

import express from 'express'; // Import Express framework
import mongoose from 'mongoose'; // Import Mongoose for MongoDB
import { swaggerSetup } from './swagger.js'; // Import Swagger setup
import interestFilterApiRouter from './routes/interestFilterRoute.js'; // Import API routes
import itinerariesFeedApiRouter from './routes/itinerariesFeedRoute.js'; // Import API routes
import dotenv from 'dotenv'; // Import dotenv for environment variables
import standardizedResponse from './middlewares/standardResponse.js'; // Import custom response middleware
import { MongoMemoryServer } from 'mongodb-memory-server';
import errorHandler from './middlewares/errorHandler.js';
import cors from 'cors'; // Import CORS middleware
import './utils/logger.js';
import config from './config.js';

dotenv.config(); // Load environment variables

const app = express(); // Create an Express application
const port = config.backendPort; // Define port

// Middlewares
app.use(express.json()); // Parse JSON bodies
app.use(standardizedResponse); // Use custom response middleware
app.use(cors());

// Routes
app.use('/api/v1', interestFilterApiRouter);
app.use('/api/v1', itinerariesFeedApiRouter);

app.get('/', (req, res) => {
  // Redirect to API documentation
  res.redirect('/api-docs');
});

app.use(errorHandler);

// Swagger configuration
swaggerSetup(app);

// Connect to MongoDB
connectDB()
  .then(() => {
    // Start server
    app.listen(port, () => {
      logger.info(`Server is running on http://localhost:${port}`);
      logger.info(
        `API documentation is available at http://localhost:${port}/api-docs`
      );
    });
  })
  .catch((error) => {
    logger.info('Error connecting to MongoDB:' + error.message);
  });

async function connectDB() {
  logger.info('Connecting to MongoDB...');
  let mongoURI = config.mongoUri;
  let mongod;

  if (process.env.NODE_ENV === 'test') {
    mongod = await MongoMemoryServer.create();
    mongoURI = mongod.getUri();
  }

  try {
    //timeout 3 seconds
    await mongoose.connect(mongoURI, { connectTimeoutMS: 3000, serverSelectionTimeoutMS: 5000 });
    logger.info(`Connected to MongoDB in ${process.env.NODE_ENV === 'test' ? 'test (in-memory)' : 'default'} mode`);
    //Delete all data in the database when connect (dev purposes)
    // await mongoose.connection.db.dropDatabase();
  } catch (error) {
    console.error('Initial connection failed, retrying with in-memory MongoDB.', error.message);
    if (!mongod) {
      mongod = await MongoMemoryServer.create();
      mongoURI = mongod.getUri();
    }
    try {
      await mongoose.connect(mongoURI);
      logger.info('Connected to in-memory MongoDB after initial failure');
    } catch (err) {
      console.error('Failed to connect to in-memory MongoDB', err);
    }
  }
};

export default app; // Export the Express application

