import jwt from 'jsonwebtoken';
import { extractAppRoute, getAppCredentials } from '../../helper/getAppCredentials.js';
import Shop from '../../models/Shop.js';

/**
 * Verifies if the Shopify access token is still valid and app is installed
 * @param {string} shop - The Shopify shop domain
 * @param {string} accessToken - The access token to verify
 * @returns {Promise<{isValid: boolean, shouldClearData: boolean}>} - Token validity and cleanup flag
 */
async function verifyAccessToken(shop, accessToken) {
    try {
        // First, try to get shop info
        const shopResponse = await fetch(`https://${shop}/admin/api/2023-10/shop.json`, {
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json'
            }
        });

        // If shop API fails, check if it's an auth issue or app uninstalled
        if (shopResponse.status === 401) {
            console.log(`Access token invalid or app uninstalled for shop: ${shop}`);
            return { isValid: false, shouldClearData: true };
        }

        if (shopResponse.status !== 200) {
            console.log(`Shop API returned status ${shopResponse.status} for shop: ${shop}`);
            return { isValid: false, shouldClearData: false };
        }

        // Double-check by trying to get app installation info
        const appResponse = await fetch(`https://${shop}/admin/api/2023-10/application_charges.json?limit=1`, {
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json'
            }
        });

        if (appResponse.status === 401) {
            console.log(`App access denied - app likely uninstalled for shop: ${shop}`);
            return { isValid: false, shouldClearData: true };
        }

        return { isValid: true, shouldClearData: false };
    } catch (error) {
        console.log("Token verification error:", error);
        // On network errors, don't clear data immediately
        return { isValid: false, shouldClearData: false };
    }
}

/**
 * Validates if a shop parameter is a valid Shopify domain
 * @param {string} shop - Shop domain to validate
 * @returns {boolean} - Whether the shop domain is valid
 */
function isValidShopDomain(shop) {
    return Boolean(shop && shop.match(/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/));
}

/**
 * Builds the Shopify OAuth installation URL
 * @param {string} shop - The shop domain
 * @param {string} clientId - The Shopify client ID
 * @param {string} scopes - The requested scopes
 * @param {string} redirectUri - The callback URI
 * @returns {string} - The complete installation URL
 */
function buildInstallUrl(shop, clientId, scopes, redirectUri) {
    return `https://${shop}/admin/oauth/authorize?client_id=${clientId}` +
           `&scope=${scopes}&redirect_uri=${redirectUri}&state=nonce123`;
}



export const installer = async (req, reply) => {
    console.log("START<<<< -------------------controllers/auth/installer ------------------- >>>> ");

    try {
        // Get JWT secret from environment
        const JWT_SECRET = process.env.JWT_SECRET;
        const APP_ROUTE = extractAppRoute(req);
        
        // Get app credentials from database based on URL
        const credentials = await getAppCredentials(req);
        if (!credentials) {
            return reply.code(500).send('App credentials not found');
        }
        
        const { CLIENT_ID, SCOPES, HOST } = credentials;
        const REDIRECT_URI = `${HOST}/server/${APP_ROUTE}/auth/callback`;
        
        const shop = req.query.shop;
        
        // With App Bridge, we don't need to check cookies
        // If the app is accessed from Shopify admin, App Bridge handles authentication
        // If accessed directly, we'll redirect to install
        console.log("1. controllers/auth/installer | Using App Bridge - no cookie session needed");

        // Handle new installation
        console.log("5. controllers/auth/installer | shop is :: --->>>> ", shop);

        if (!shop) {
            return reply.code(400).send('Missing shop parameter');
        }

        // Validate the shop parameter
        if (!isValidShopDomain(shop)) {
            return reply.code(400).send('Invalid shop parameter');
        }

        // Redirect to authorization
        const installUrl = buildInstallUrl(shop, CLIENT_ID, SCOPES, REDIRECT_URI);
        return reply.redirect(installUrl);
    } catch (error) {
        console.error("controllers/auth/installer | error is:---> ", error);
        return reply.code(500).send('Something went wrong');
    }
    
}