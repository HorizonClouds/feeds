import { RateLimitExceededError, TooManyRequestsError } from './customErrors.js';
import config from '../config.js';

const rateLimitConfig = {
  maxRequestsPerMinute: config.maxRequestsPerMinute,
  minIntervalBetweenRequests: config.minIntervalBetweenRequests,
};

// Array to store timestamps of requests
let requestTimestamps = [];

export const rateLimiter = () => {
  const currentTime = Date.now();

  // Remove timestamps that are older than one minute
  requestTimestamps = requestTimestamps.filter((timestamp) => currentTime - timestamp < 60000);
  let timeSinceLastRequest = currentTime - (requestTimestamps[requestTimestamps.length - 1] ?? 0);
  let details = {
    requestsInLastMinute: requestTimestamps.length,
    maxRequestsPerMinute: rateLimitConfig.maxRequestsPerMinute,
    timeSinceLastRequest: timeSinceLastRequest,
    minIntervalBetweenRequests: rateLimitConfig.minIntervalBetweenRequests,
  };
  logger.info(JSON.stringify(details));

  // Check the number of requests in the last 60 seconds (moving window)
  if (requestTimestamps.length >= rateLimitConfig.maxRequestsPerMinute) {
    throw new TooManyRequestsError('Too many requests in the last minute', details);
  }

  // Ensure the minimum interval between requests is respected
  if (requestTimestamps.length > 0 && timeSinceLastRequest < rateLimitConfig.minIntervalBetweenRequests) {
    throw new RateLimitExceededError('Too many requests in a short period', details);
  }
  requestTimestamps.push(currentTime);
};
