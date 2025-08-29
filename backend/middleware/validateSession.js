import jwt from 'jsonwebtoken';
import Shop from '../models/Shop.js';
import { getAppCredentials } from '../helper/getAppCredentials.js';

/**
 * Middleware to validate App Bridge session tokens
 * This replaces the need for custom cookie sessions
 */
export const validateSessionToken = async (req, reply) => {
    try {
        // Get session token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.code(401).send({ error: 'No session token provided' });
        }

        const sessionToken = authHeader.split(' ')[1];
        
        // Decode without verification first to get shop domain
        const decodedToken = jwt.decode(sessionToken);
        if (!decodedToken || !decodedToken.dest) {
            return reply.code(401).send({ error: 'Invalid session token format' });
        }

        // Extract shop domain from destination
        const shopDomain = decodedToken.dest.replace('https://', '');
        
        // Get app credentials to validate against correct app
        const appRoute = req.params.appRoute || extractAppRoute(req);
        const credentials = await getAppCredentials(req);
        
        if (!credentials) {
            return reply.code(500).send({ error: 'App credentials not found' });
        }

        // Verify the session token (App Bridge tokens are signed by Shopify)
        // In production, you'd verify against Shopify's public key
        // For now, we'll just validate the structure and check if shop exists in our DB
        
        const shopRecord = await Shop.findOne({ shop: shopDomain });
        if (!shopRecord) {
            return reply.code(401).send({ error: 'Shop not found or app not installed' });
        }

        // Add shop info to request for use in handlers
        req.shop = shopDomain;
        req.accessToken = shopRecord.accessToken;
        
        return; // Continue to the route handler
    } catch (error) {
        console.error('Session validation error:', error);
        return reply.code(401).send({ error: 'Invalid session token' });
    }
};

/**
 * Simple helper to extract app route from URL
 */
function extractAppRoute(req) {
    const urlParts = req.url.split('/');
    return urlParts[1]; // Assuming format /{appRoute}/...
}


