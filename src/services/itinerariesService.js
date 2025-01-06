import axios from 'axios';
import { getServiceUrl } from '../utils/infrastructure.js';
import jwt from 'jsonwebtoken';
import config from '../config.js';
import { ItinerariesServiceError } from '../utils/customErrors.js';
import { checkCache, storeInCache } from './cacheService.js';

export async function getItineraries() {
    const url = "getItineraries";
    const cachedData = await checkCache(url);
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
        const response = await axios.get(`${itinerariesServiceUrl}/api/v1/itineraries`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        await storeInCache(url, response.data);
        logger.info('Itineraries successfully retrieved.');
        logger.debug(JSON.stringify(response.data));
        return response.data;
    } catch (error) {
        logger.info('Error retrieving itineraries');
        throw new ItinerariesServiceError('Error retrieving itinerary details', { code: error.code, message: error.message, responseData: error.response?.data });
    }
}

export default { getItineraries };
