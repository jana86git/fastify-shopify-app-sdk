// Import the framework and instantiate it
import dotenv from 'dotenv';
dotenv.config();
import Fastify from 'fastify'
import fs from 'fs';
import cookie from '@fastify/cookie';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { installer } from './controllers/auth/installer.js';
import { handleAuthCallback } from './controllers/auth/handleAuthCallback.js';
import { getAppCredentials } from './helper/getAppCredentials.js';

import connectDB from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jwt_secret = process.env.JWT_SECRET;

const fastify = Fastify({
    logger: true,
        https: {
            key: fs.readFileSync('./certs/key.pem'),
            cert: fs.readFileSync('./certs/cert.pem')
        }
})

await connectDB();

// Register CORS plugin to allow all origins
fastify.register(async function (fastify) {
    fastify.addHook('preHandler', async (request, reply) => {
        const corsHandler = cors({
            origin: '*', // Allow all origins
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        });
        
        return new Promise((resolve) => {
            corsHandler(request.raw, reply.raw, resolve);
        });
    });
});

// Register cookie plugin
await fastify.register(cookie, {
    secret: jwt_secret, // for signed cookies
    hook: 'onRequest'
})

// // Conditional serving based on environment
// if (process.env.NODE_ENV === 'production') {
//     // Serve static files from the frontend/dist directory in production
//     await fastify.register(import('@fastify/static'), {
//         root: path.join(__dirname, '../frontend/dist'),
//         prefix: '/'
//     })
    
//     // Serve index.html for all routes that should be handled by the frontend
//     fastify.get('/', (req, reply) => {
//         reply.sendFile('index.html')
//     })
// } else {
//     // In development, proxy requests to the Vite dev server
//     await fastify.register(import('@fastify/http-proxy'), {
//         upstream: 'http://localhost:5173', // Default Vite dev server port
//         prefix: '/',
//         rewritePrefix: '/',
//         ws: true, // Enable WebSocket support for hot reloading
//         websocket: true, // Additional WebSocket support
//         replyOptions: {
//             rewriteRequestHeaders: (req, headers) => {
//                 // Ensure proper host header for WebSocket connections
//                 return {
//                     ...headers,
//                     host: 'localhost:5173'
//                 }
//             }
//         }
//     })
// }

await fastify.register(import('@fastify/static'), {
    root: path.join(__dirname, '../fastify-test-one/dist'),
    prefix: '/app-one/',
    index: ['index.html'],
    decorateReply: false // Prevent adding sendFile decorator
})

await fastify.register(import('@fastify/static'), {
    root: path.join(__dirname, '../fastify-test-two/dist'),
    prefix: '/app-two/',
    index: ['index.html'],
    decorateReply: false // Prevent adding sendFile decorator
})

// Handle SPA routing - serve index.html for routes that don't match static files
fastify.setNotFoundHandler(async (request, reply) => {
    if (request.url.startsWith('/app-one')) {
        // For SPA routing, we need to send the index.html file
        const indexPath = path.join(__dirname, '../fastify-test-one/dist/index.html')
        reply.type('text/html')
        const htmlContent = fs.readFileSync(indexPath, 'utf8')
        return reply.send(htmlContent)
    } else if (request.url.startsWith('/app-two')) {
        // For SPA routing, we need to send the index.html file
        const indexPath = path.join(__dirname, '../fastify-test-two/dist/index.html')
        reply.type('text/html')
        const htmlContent = fs.readFileSync(indexPath, 'utf8')
        return reply.send(htmlContent)
    } else {
        reply.code(404).send('Not Found')
    }
})





// Dynamic routes for different app handles
fastify.get('/:appRoute', installer);
fastify.get('/server/:appRoute/auth/callback', handleAuthCallback);

fastify.get('/server/:appRoute/get-data', async (req, reply) => {
    // const APP_ROUTE = req.params.appRoute;
    const data = await getAppCredentials(req);
    return reply.send(data);

    // return reply.send({message: 'Data fetched successfully'});
});

// Run the server!
try {
    await fastify.listen({ port: 3000 })
    console.log('Server is running on port 3000')
} catch (err) {
    fastify.log.error(err)
    process.exit(1)
}