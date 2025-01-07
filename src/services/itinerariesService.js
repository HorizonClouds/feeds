import axios from 'axios';
import { getServiceUrl } from '../utils/infrastructure.js';
import jwt from 'jsonwebtoken';
import config from '../config.js';
import { ItinerariesServiceError } from '../utils/customErrors.js';
import { checkCache, storeInCache } from './cacheService.js';
import circuitBreaker from '../utils/circuitBreaker.js';

export async function getItineraries() {
    const url = "getItineraries";
    let cachedData;
    if(config.redisCacheEnabled === 'true')
        cachedData = await checkCache(url);

    if (cachedData) {
        logger.info('[CACHED] Itineraries successfully retrieved.');
        return cachedData;
    }

    const itinerariesServiceUrl = await getServiceUrl('itineraries');
    if (!itinerariesServiceUrl) {
        logger.info('Cannot retrieve itinerary details: Itineraries service URL not found.');
        return null;
    }
    const token = jwt.sign({ serviceId: 'feeds-service', message: "Hello From FEEDS Service" }, config.jwtSecret, {});

    try {
        let callback = async () => {
            try {
                let res = await axios.get(`${itinerariesServiceUrl}/api/v1/itineraries`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                return res.data;
            } catch (error) {
                throw new ItinerariesServiceError('Error retrieving itinerary details', result.details);
            }
        }
        let result = await circuitBreaker(callback);
        await storeInCache(url, result.response.data);
        logger.info('Itineraries successfully retrieved.');
        return result.response.data;
    } catch (error) {
        logger.info('Error retrieving itineraries');
        throw new ItinerariesServiceError('Error retrieving itinerary details', error);
    }
}

export default { getItineraries };
