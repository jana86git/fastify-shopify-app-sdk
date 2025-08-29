import mongoose from 'mongoose';

const AppCredentialsSchema = new mongoose.Schema({
    client_id: { 
        type: String, 
        required: true 
    },
    client_secret: { 
        type: String, 
        required: true 
    },
    scopes: { 
        type: String, 
        required: true 
    },
    shopify_host: { 
        type: String, 
        required: true 
    },
    app_route: { 
        type: String, 
        required: true 
    }
}, { 
    timestamps: true,
    collection: 'app-credentials'  // Specify the exact collection name
});

export default AppCredentialsSchema;
