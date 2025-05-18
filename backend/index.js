// Import the framework and instantiate it
import dotenv from 'dotenv';
dotenv.config();
import Fastify from 'fastify'
import fs from 'fs';
import cookie from '@fastify/cookie';
import jwt from 'jsonwebtoken';
import { installer } from './controllers/auth/installer.js';
import { handleAuthCallback } from './controllers/auth/handleAuthCallback.js';

import connectDB from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jwt_secret = process.env.JWT_SECRET;

const fastify = Fastify({
    logger: false,
    https: {
        key: fs.readFileSync('./certs/key.pem'),
        cert: fs.readFileSync('./certs/cert.pem')
    }
})

await connectDB();

// Register cookie plugin
await fastify.register(cookie, {
    secret: jwt_secret, // for signed cookies
    hook: 'onRequest'
})

// Conditional serving based on environment
if (process.env.NODE_ENV === 'production') {
    // Serve static files from the frontend/dist directory in production
    await fastify.register(import('@fastify/static'), {
        root: path.join(__dirname, '../frontend/dist'),
        prefix: '/'
    })
    
    // Serve index.html for all routes that should be handled by the frontend
    fastify.get('/', (req, reply) => {
        reply.sendFile('index.html')
    })
} else {
    // In development, proxy requests to the Vite dev server
    await fastify.register(import('@fastify/http-proxy'), {
        upstream: 'http://localhost:5173', // Default Vite dev server port
        prefix: '/',
        rewritePrefix: '/',
        ws: true, // Enable WebSocket support for hot reloading
        websocket: true, // Additional WebSocket support
        replyOptions: {
            rewriteRequestHeaders: (req, headers) => {
                // Ensure proper host header for WebSocket connections
                return {
                    ...headers,
                    host: 'localhost:5173'
                }
            }
        }
    })
}

fastify.get('/install', installer);

fastify.get('/auth/callback', handleAuthCallback);

// Run the server!
try {
    await fastify.listen({ port: 3000 })
    console.log('Server is running on port 3000')
} catch (err) {
    fastify.log.error(err)
    process.exit(1)
}