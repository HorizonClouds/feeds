import express from 'express'; // Import Express framework
import { swaggerSetup } from './swagger.js'; // Import Swagger setup
import interestFilterApiRouter from './routes/interestFilterRoute.js'; // Import API routes
import itinerariesFeedApiRouter from './routes/itinerariesFeedRoute.js'; // Import API routes
import standardizedResponse from './middlewares/standardResponse.js'; // Import custom response middleware
import errorHandler from './middlewares/errorHandler.js';
import cors from 'cors'; // Import CORS middleware
import './utils/logger.js';
import config from './config.js';
import rateLimit from 'express-rate-limit'; // Import rate limiting middleware

export const app = express(); // Create an Express application
const port = config.backendPort; // Define port

// Middlewares
app.use(express.json()); // Parse JSON bodies
app.use(standardizedResponse); // Use custom response middleware
app.use(cors());

// Apply rate limiting middleware
const limiter = rateLimit({
  windowMs: config.throttleWindowMs, 
  max: config.throttleMax, 
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.',
    appCode: 'TOO_MANY_REQUESTS',
    timestamp: new Date().toISOString(),
  },
});

app.use(limiter);

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

export async function startServer(app) {
  return new Promise((resolve, reject) => {
    app.listen(port, () => {
      logger.info(`Server is running on http://localhost:${port}`);
      logger.info(`API documentation is available at http://localhost:${port}/api-docs`);
      logger.debug(`Debug logs are enabled`);
      resolve();
    }).on('error', (err) => {
      reject(err);
    });
  });
}

export default app; // Export the Express application

