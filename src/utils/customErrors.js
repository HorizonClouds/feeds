import { stdOptions } from './standardResponse.js';

// Common error itineraries
export class NotFoundError extends Error {
  constructor(message = 'Resource not found', details) {
    super('[EXCEPTION]: ' + message);
    this.details = details;
    this.appCode = stdOptions.appCodes.notFound;
    this.statusCode = stdOptions.codes.notFound;
  }
}

export class ValidationError extends Error {
  constructor(message = 'Validation failed', details) {
    super('[EXCEPTION]: ' + message);
    this.details = details;
    this.appCode = stdOptions.appCodes.validationError;
    this.statusCode = stdOptions.codes.badRequest;
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized', details) {
    super('[EXCEPTION]: ' + message);
    this.details = details;
    this.appCode = stdOptions.appCodes.unauthorized;
    this.statusCode = stdOptions.codes.unauthorized;
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden', details) {
    super('[EXCEPTION]: ' + message);
    this.details = details;
    this.appCode = stdOptions.appCodes.forbidden;
    this.statusCode = stdOptions.codes.forbidden;
  }
}

export class ItinerariesServiceError extends Error {
  constructor(message = 'Error in Itineraries Service', details) {
    super('[EXCEPTION]: ' + message);
    this.details = details;
    this.appCode = stdOptions.appCodes.internalServerError;
    this.statusCode = stdOptions.codes.internalServerError;
  }
}

export class RateLimitExceededError extends Error {
  constructor(message = 'Rate limit exceeded', details) {
    super('[EXCEPTION]: ' + message);
    this.details = details;
    this.appCode = stdOptions.appCodes.rateLimitExceeded;
    this.statusCode = stdOptions.codes.badRequest;
  }
}

export class TooManyRequestsError extends Error {
  constructor(message = 'Too many requests', details) {
    super('[EXCEPTION]: ' + message);
    this.details = details;
    this.appCode = stdOptions.appCodes.tooManyRequests;
    this.statusCode = stdOptions.codes.badRequest;
  }
}

export class CircuitBreakerError extends Error {
  constructor(message = 'Circuit breaker error', details) {
    super('[EXCEPTION]: ' + message);
    this.details = details;
    this.appCode = stdOptions.appCodes.internalServerError;
    this.statusCode = stdOptions.codes.internalServerError;
  }
}

export default {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ItinerariesServiceError,
  RateLimitExceededError,
  TooManyRequestsError,
  CircuitBreakerError,
};