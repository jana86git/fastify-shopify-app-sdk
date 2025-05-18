import { getAccessToken } from '../../helper/getAccessToken.js';
import jwt from 'jsonwebtoken';
import Shop from '../../models/Shop.js';
import { runGraphiql } from '../../helper/runGraphiql.js';
export const handleAuthCallback = async (req, reply) => {
    try {
        const { shop, code, hmac, state } = req.query;
        const jwt_secret = process.env.JWT_SECRET;
        const client_id = process.env.SHOPIFY_CLIENT_ID;
        const client_secret = process.env.SHOPIFY_CLIENT_SECRET;

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

        // Create JWT token with shop and access token
        const token = jwt.sign(
            { 
                shop,
                accessToken
            },
            jwt_secret,
            { expiresIn: '24h' }
        );

        // Set the JWT as a cookie
        reply.setCookie('shopify_session', token, {
            path: '/',
            signed: true,
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

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

        // Redirect to the root path
        return reply.redirect(`https://${shop}/admin/apps/${appHandle}`);
       
    } catch (error) {
        console.log("controllers/auth/handleAuthCallback | error is:---> ", error);
        return reply.code(500).send('Something went wrong');
    }
}