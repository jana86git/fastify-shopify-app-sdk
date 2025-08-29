# Fastify Shopify App SDK

A comprehensive, multi-app Shopify development framework built with Fastify and React. This SDK enables developers to create, manage, and deploy multiple Shopify apps from a single codebase with shared authentication, database management, and frontend infrastructure.

## 🚀 Features

- **Multi-App Architecture**: Host multiple Shopify apps from a single backend
- **Secure OAuth 2.0 Authentication**: Complete Shopify OAuth flow implementation
- **App Bridge Integration**: Native Shopify App Bridge support for embedded apps
- **Session Management**: JWT-based session validation with automatic token verification
- **Database Integration**: MongoDB with Mongoose ODM for data persistence
- **Modern Frontend**: React apps with Shopify Polaris design system
- **Extension Support**: Shopify theme extensions included
- **HTTPS Support**: SSL/TLS encryption with self-signed certificates
- **Development Ready**: Hot reload and development tools included

## 📁 Project Structure

```
fastify-shopify-app-sdk/
├── backend/                    # Main Fastify server
│   ├── controllers/           # Route controllers
│   │   ├── auth/             # Authentication handlers
│   │   │   ├── installer.js  # OAuth installation flow
│   │   │   └── handleAuthCallback.js # OAuth callback handler
│   │   └── webhooks/         # Shopify webhook handlers
│   ├── middleware/           # Custom middleware
│   │   └── validateSession.js # Session token validation
│   ├── models/              # Database models
│   │   ├── schemas/         # Mongoose schemas
│   │   │   ├── Shop.js      # Shop data schema
│   │   │   └── AppCredentials.js # App credentials schema
│   │   ├── Shop.js          # Shop model
│   │   └── AppCredentials.js # App credentials model
│   ├── helper/              # Utility functions
│   │   ├── getAppCredentials.js # Credential management
│   │   ├── getAccessToken.js    # Token utilities
│   │   └── runGraphiql.js       # GraphQL utilities
│   ├── certs/               # SSL certificates
│   ├── db.js                # Database connection
│   ├── index.js             # Main server file
│   └── package.json         # Backend dependencies
├── fastify-test-one/          # First React app
│   ├── src/
│   │   ├── pages/           # App pages
│   │   ├── App.jsx          # Main app component
│   │   └── Routes.jsx       # Route configuration
│   ├── dist/                # Built assets
│   └── package.json         # Frontend dependencies
├── fastify-test-two/          # Second React app
│   ├── src/
│   │   ├── pages/           # App pages
│   │   ├── App.jsx          # Main app component
│   │   └── Routes.jsx       # Route configuration
│   ├── dist/                # Built assets
│   └── package.json         # Frontend dependencies
├── extensions/                # Shopify extensions
│   └── news-letter/          # Theme extension example
│       ├── blocks/          # Liquid blocks
│       ├── snippets/        # Liquid snippets
│       ├── locales/         # Translations
│       └── shopify.extension.toml # Extension config
└── package.json              # Root dependencies
```

## 🛠️ Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB database
- Shopify Partner account
- SSL certificates (for HTTPS)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fastify-shopify-app-sdk
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies for both apps
cd ../fastify-test-one
npm install

cd ../fastify-test-two
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/shopify-apps

# JWT Secret for session management
JWT_SECRET=your-super-secret-jwt-key

# Server Configuration
NODE_ENV=development
PORT=3000
```

### 4. SSL Certificates

Generate self-signed certificates for development:

```bash
cd backend/certs
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

### 5. Database Setup

Ensure MongoDB is running and create the required collections:

1. **App Credentials Collection**: Store app credentials for different routes
2. **Shops Collection**: Store shop access tokens and metadata

### 6. Shopify App Configuration

For each app you want to create:

1. Create a new app in your Shopify Partner dashboard
2. Configure the app URLs:
   - App URL: `https://your-domain.com/app-one` (or `/app-two`)
   - Allowed redirection URLs: `https://your-domain.com/server/app-one/auth/callback`

3. Add app credentials to your database:

```javascript
// Example: Adding credentials for app-one
const AppCredentials = require('./backend/models/AppCredentials');

await AppCredentials.create({
    client_id: 'your-shopify-client-id',
    client_secret: 'your-shopify-client-secret',
    scopes: 'read_products,write_products',
    shopify_host: 'https://your-domain.com',
    app_route: 'app-one'
});
```

## 🚀 Usage

### Starting the Development Server

1. **Build Frontend Apps** (first time only):
   ```bash
   # Build app-one
   cd fastify-test-one
   npm run build
   
   # Build app-two
   cd ../fastify-test-two
   npm run build
   ```

2. **Start the Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```

The server will start on `https://localhost:3000`

### Frontend Development

For active frontend development with hot reload:

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend dev server (app-one)
cd fastify-test-one
npm run dev

# Terminal 3: Start frontend dev server (app-two)
cd fastify-test-two
npm run dev
```

## 🔐 Authentication Flow

### 1. App Installation
- User visits: `https://your-domain.com/app-one?shop=store.myshopify.com`
- System redirects to Shopify OAuth authorization
- User authorizes the app
- Shopify redirects to: `https://your-domain.com/server/app-one/auth/callback`

### 2. Session Management
- App uses Shopify App Bridge for embedded experience
- JWT tokens validate API requests
- Session middleware validates all protected routes

### 3. API Access
```javascript
// Example API call with session validation
fetch('/server/app-one/get-data', {
    headers: {
        'Authorization': `Bearer ${sessionToken}`
    }
});
```

## 📊 Database Models

### Shop Model
```javascript
{
    shop: String,        // Shopify domain (store.myshopify.com)
    accessToken: String, // Shopify access token
    updatedAt: Date,     // Last update timestamp
    createdAt: Date      // Creation timestamp
}
```

### App Credentials Model
```javascript
{
    client_id: String,     // Shopify app client ID
    client_secret: String, // Shopify app client secret
    scopes: String,        // Requested permissions
    shopify_host: String,  // Your app's host URL
    app_route: String,     // App route identifier (app-one, app-two)
    createdAt: Date,       // Creation timestamp
    updatedAt: Date        // Last update timestamp
}
```

## 🎨 Frontend Architecture

### React Apps with Polaris

Each frontend app uses:
- **React 19**: Latest React features
- **Shopify Polaris**: Official Shopify design system
- **React Router**: Client-side routing
- **Vite**: Fast build tool and dev server

### App Structure
```javascript
// App.jsx example
export default function App() {
    const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", { eager: true });
    
    return (
        <BrowserRouter basename="/app-one">
            <AppProvider i18n={enTranslations}>
                <ui-title-bar title="Shop App Builder">
                </ui-title-bar>
                <ui-nav-menu>
                    <Link to="/" rel="home">Home</Link>
                    <Link to="/about">About</Link>
                </ui-nav-menu>
                <Routes pages={pages} />
            </AppProvider>
        </BrowserRouter>
    );
}
```

## 🔌 Extension Development

### Theme Extensions

The project includes a sample newsletter theme extension:

```toml
# extensions/news-letter/shopify.extension.toml
name = "news-letter"
type = "theme"
```

Features:
- Star rating blocks
- Newsletter signup forms
- Liquid templates and snippets
- Localization support

## 🛡️ Security Features

### OAuth 2.0 Implementation
- Secure authorization code flow
- State parameter validation
- Token verification against Shopify APIs
- Automatic token refresh handling

### Session Security
- JWT-based session tokens
- Signed cookies for additional security
- HTTPS enforcement
- CORS configuration

### Input Validation
- Shop domain validation
- Request parameter sanitization
- SQL injection prevention
- XSS protection

## 📡 API Endpoints

### Authentication Endpoints
- `GET /:appRoute` - App installation initiation
- `GET /server/:appRoute/auth/callback` - OAuth callback handler

### Protected Endpoints
- `GET /server/:appRoute/get-data` - Fetch app data (requires authentication)

### Static File Serving
- `/app-one/*` - Serves first React app
- `/app-two/*` - Serves second React app

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**:
   ```env
   NODE_ENV=production
   MONGO_URI=mongodb://your-production-db
   JWT_SECRET=your-production-secret
   ```

2. **SSL Certificates**: Replace self-signed certificates with production certificates

3. **Build Frontend Apps**:
   ```bash
   cd fastify-test-one && npm run build
   cd fastify-test-two && npm run build
   ```

4. **Database Migration**: Ensure production database has required collections

5. **Shopify App Configuration**: Update app URLs to production domain

### Deployment Options

- **Traditional VPS**: Use PM2 for process management
- **Docker**: Containerize the application
- **Serverless**: Adapt for platforms like Vercel or Netlify
- **Cloud Platforms**: Deploy to AWS, Google Cloud, or Azure

## 🧪 Development Tips

### Adding New Apps

1. Create a new React app directory (e.g., `fastify-test-three`)
2. Add static file serving in `backend/index.js`:
   ```javascript
   await fastify.register(import('@fastify/static'), {
       root: path.join(__dirname, '../fastify-test-three/dist'),
       prefix: '/app-three/',
       index: ['index.html'],
       decorateReply: false
   })
   ```
3. Update the 404 handler to serve the new app
4. Add app credentials to the database

### Custom Middleware

Add custom middleware by registering new plugins:

```javascript
// backend/index.js
fastify.register(async function (fastify) {
    fastify.addHook('preHandler', async (request, reply) => {
        // Your custom logic here
    });
});
```

### Database Utilities

Access database models anywhere in your application:

```javascript
import Shop from './models/Shop.js';
import AppCredentials from './models/AppCredentials.js';

// Find shops
const shops = await Shop.find({ updatedAt: { $gte: yesterday } });

// Update credentials
await AppCredentials.findOneAndUpdate(
    { app_route: 'app-one' },
    { scopes: 'read_products,write_products,read_orders' }
);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

1. Check the [Issues](https://github.com/your-repo/issues) section
2. Review Shopify's [App Development Documentation](https://shopify.dev/apps)
3. Consult [Fastify Documentation](https://www.fastify.io/docs/)
4. Read [React Documentation](https://react.dev/)

## 🔗 Related Resources

- [Shopify App Bridge](https://shopify.dev/apps/tools/app-bridge)
- [Shopify Polaris Design System](https://polaris.shopify.com/)
- [Fastify Framework](https://www.fastify.io/)
- [MongoDB with Mongoose](https://mongoosejs.com/)
- [Vite Build Tool](https://vitejs.dev/)

---

**Happy Coding!** 🎉

Built with ❤️ using Fastify, React, and Shopify technologies.
