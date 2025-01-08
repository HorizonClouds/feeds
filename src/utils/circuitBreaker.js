import { CircuitBreakerError, RateLimitExceededError, TooManyRequestsError } from './customErrors.js';
import config from '../config.js';
import { rateLimiter } from '../utils/rateLimiter.js';
let successCount = 0;
let errorTimestamps = [];
let lastFailureTime = 0; // Old as f;
let circuitState = 'CLOSED'; // Possible states: CLOSED, OPEN, HALF-OPEN

/**
 * This function implements a circuit breaker pattern.
 * States:
 * - CLOSED: Normal operation, if recent failures reach the threshold, the circuit opens
 * - OPEN: Circuit is open, no requests are allowed to pass through. After a timeout, the circuit goes to HALF-OPEN
 * - HALF-OPEN: If failure happens, the circuit goes to OPEN. If multiple requests succeed, the circuit goes to CLOSED
 * 
 * @param {Function} getResponseCallback - Function that returns a promise with the response
 * @param {Error} failError - Error to be thrown in case of failure
 * @param {Boolean} forceOpen - Force the circuit to open
 * @returns {Promise} - Promise with the response of the getResponseCallback
 */
const circuitBreaker = async (getResponseCallback, forceOpen = false) => {
    const timeLeftUntilReset = (lastFailureTime + config.CBreakerResetTimeout) - Date.now();
    const failureThreshold = config.CBreakerFailureThreshold;
    const resetTimeout = config.CBreakerResetTimeout;
    const successThreshold = config.CBreakerSuccessThreshold;
    const getUpdatedDetails = ()=> ({
        successCount,
        successThreshold,
        recentErrors: errorTimestamps.length,
        failureThreshold,
        resetTimeout,
        timeLeftUntilReset,
        circuitState,
    });
    // Only errors that happened in the last [resetTimeout] are kept. (Timeout not passed)
    errorTimestamps = errorTimestamps.filter(errorTimestamp => errorTimestamp + resetTimeout > Date.now());
    let response = null;
    // Case OPEN

    if(forceOpen){
        logger.debug('Forcing open');
        lastFailureTime = Date.now();
        errorTimestamps.push(Date.now());
        successCount = 0;  
        circuitState = 'OPEN';
        throw new CircuitBreakerError('Circuit is forced open.', getUpdatedDetails());
    }
    if (circuitState === 'OPEN') {
        if (timeLeftUntilReset <= 0) { // Timeout has passed, do not throw error
            circuitState = 'HALF-OPEN';
            logger.debug('Circuit is half open');
        } else {
            throw new CircuitBreakerError('Too many errors, circuit is open.', getUpdatedDetails());
        }
    }
    // Case HALF-OPEN or CLOSED (normal operation)
    try {
        rateLimiter(); // Rate limiter
        response = await getResponseCallback();
        // No error detected, increase success count
        successCount++;
        if (successCount >= successThreshold) {
            circuitState = 'CLOSED';
        }
    } catch (error) {
        if (error instanceof RateLimitExceededError || error instanceof TooManyRequestsError) throw error; // Do not count these errors
        errorTimestamps.push(Date.now());
        lastFailureTime = Date.now(); // This is  = errorTimestamps[-1] but it is not used
        if (errorTimestamps.length >= failureThreshold) {
            successCount = 0;
            circuitState = 'OPEN';
            errorTimestamps = [];
        }
        throw error;
    }

    return { response: response, details: getUpdatedDetails() };
}

export default circuitBreaker;
