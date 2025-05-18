import jwt from 'jsonwebtoken';

/**
 * Verifies if the Shopify access token is still valid
 * @param {string} shop - The Shopify shop domain
 * @param {string} accessToken - The access token to verify
 * @returns {Promise<boolean>} - Whether the token is valid
 */
async function verifyAccessToken(shop, accessToken) {
    try {
        const response = await fetch(`https://${shop}/admin/api/2023-10/shop.json`, {
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json'
            }
        });

        return response.status === 200;
    } catch (error) {
        console.log("Token verification error:", error);
        return false;
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
        // Environment variables
        const JWT_SECRET = process.env.JWT_SECRET;
        const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
        const SCOPES = process.env.SHOPIFY_SCOPES;
        const HOST = process.env.SHOPIFY_HOST;
        const REDIRECT_URI = `${HOST}/auth/callback`;
        
        const shop = req.query.shop;
        
        // Check for existing session cookie
        const sessionCookie = req.cookies.shopify_session;
        if (sessionCookie) {
            const cookieValue = req.unsignCookie(sessionCookie);
            console.log("1. controllers/auth/installer | cookieValue is :: --->>>> ", cookieValue);
            
            if (cookieValue.valid) {
                try {
                    const session = jwt.verify(cookieValue.value, JWT_SECRET);
                    console.log("2. controllers/auth/installer | session is :: --->>>> ", session);

                    // Verify if the access token is still valid
                    const isValid = await verifyAccessToken(session.shop, session.accessToken);

                    console.log("3. controllers/auth/installer | isValid is :: --->>>> ", isValid);

                    if (isValid) {
                        return reply.redirect(`${HOST}/?shop=${session.shop}&host=${req.query.host}`);
                    } else {
                        // Clear invalid cookie
                        reply.clearCookie('shopify_session', { path: '/' });
                        console.log("4. controllers/auth/installer | App appears to be uninstalled, clearing session");
                        return reply.redirect(buildInstallUrl(shop, CLIENT_ID, SCOPES, REDIRECT_URI));
                    }
                } catch (jwtError) {
                    // Handle JWT verification errors
                    console.error("E1. controllers/auth/installer | JWT verification error:", jwtError.message);
                    reply.clearCookie('shopify_session', { path: '/' });
                    return reply.redirect(buildInstallUrl(shop, CLIENT_ID, SCOPES, REDIRECT_URI));
                }
            }
        }

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