import { getAccessToken } from '../../helper/getAccessToken.js';
import jwt from 'jsonwebtoken';
import Shop from '../../models/Shop.js';
import { runGraphiql } from '../../helper/runGraphiql.js';
import { getAppCredentials } from '../../helper/getAppCredentials.js';
export const handleAuthCallback = async (req, reply) => {
    try {
        const { shop, code, hmac, state } = req.query;
        const jwt_secret = process.env.JWT_SECRET;
        
        // Get app credentials from database based on URL
        const credentials = await getAppCredentials(req);
        if (!credentials) {
            return reply.code(500).send('App credentials not found');
        }
        
        const { CLIENT_ID: client_id, CLIENT_SECRET: client_secret, APP_ROUTE } = credentials;

        if (!shop || !code || !hmac || !state) {
            return reply.code(400).send('Missing parameters');
        }
        const state_parts = state.split('|');
        const nonce = state_parts[0];
        const return_url = state_parts[1];

        if (nonce !== 'nonce123') {
            return reply.code(400).send('Invalid nonce');
        }

      
        console.log("shop is ::  --->>>> ", shop);

        const accessToken = await getAccessToken(shop, code, client_id, client_secret);

        console.log("access token is ::  --->>>> ", accessToken);

     
       

        // Store or update shop data using Mongoose
        await Shop.findOneAndUpdate(
            { shop },
            { shop, accessToken, updatedAt: new Date() },
            { upsert: true, new: true }
        );
        
        console.log("Shop data stored using Mongoose");

        // No need for custom session cookies when using App Bridge!
        // App Bridge handles session tokens automatically
        console.log("Access token stored in database, App Bridge will handle sessions");

        const data = await runGraphiql({
            query: `
            query {
                currentAppInstallation{
                app{
                    handle
                    }
                }
            }
            `,
            variables: null,
            accessToken: accessToken,
            shop: shop
        })
        console.log("data is ::  --->>>> ", data);
        const appHandle = data?.data?.currentAppInstallation?.app?.handle;
        console.log("appHandle is ::  --->>>> ", appHandle);

        // With App Bridge, redirect to your React app
        // App Bridge will handle authentication and session management
        return reply.redirect(`${credentials.HOST}/${APP_ROUTE}/?shop=${shop}&host=${req.query.host}`);
       
    } catch (error) {
        console.log("controllers/auth/handleAuthCallback | error is:---> ", error);
        return reply.code(500).send('Something went wrong');
    }
}