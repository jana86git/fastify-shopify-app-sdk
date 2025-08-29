import AppCredentials from '../models/AppCredentials.js';

/**
 * Extracts app route from the request path or parameters
 * @param {Object} req - The Fastify request object
 * @returns {string|null} - The app route or null if not found
 */
export function extractAppRoute(req) {
    // First try to get from route parameters (for /:appRoute and /server/:appRoute routes)
    if (req.params && req.params.appRoute) {
        return req.params.appRoute;
    }

    console.log("URL is :: --->>>> ", req.url);
    
    // Fallback to parsing the URL path
    // Remove query parameters first by splitting on '?'
    const pathWithoutQuery = req.url.split('?')[0];
    const segments = pathWithoutQuery.split('/').filter(segment => segment.length > 0);
    
    // Handle different URL patterns:
    // For /server/app-one/auth/callback -> return "app-one"
    // For /app-one -> return "app-one"
    if (segments.length >= 2 && segments[0] === 'server') {
        return segments[1]; // Return the app route after 'server'
    }
    
    // For direct app routes like /app-one
    return segments.length > 0 ? segments[0] : null;
}

/**
 * Fetches app credentials from the database based on the request path
 * @param {Object} req - The Fastify request object
 * @returns {Promise<Object|null>} - The app credentials or null if not found
 */
export async function getAppCredentials(req) {
    console.log("########################################################")
    console.log(" GETTING APP CREDENTIALS ")
    try {
       
        const appRoute = extractAppRoute(req);
        
        if (!appRoute) {
            console.error('No app route found in URL or params:', req.url);
            return null;
        }

        console.log(`Fetching credentials for app route: ${appRoute}`);
        
        const credentials = await AppCredentials.findOne({ app_route: appRoute });
        
        if (!credentials) {
            console.error(`No credentials found for app route: ${appRoute}`);
            return null;
        }

        console.log(" GETTING APP CREDENTIALS DONE ")
        console.log("########################################################")

        return {
            CLIENT_ID: credentials.client_id,
            CLIENT_SECRET: credentials.client_secret,
            SCOPES: credentials.scopes,
            HOST: credentials.shopify_host,
            APP_ROUTE: credentials.app_route
        };
    } catch (error) {
        console.error('Error fetching app credentials:', error);
        console.log(" GETTING APP CREDENTIALS DONE ")
        console.log("########################################################")
        return null;
      
    }
   
    
}
