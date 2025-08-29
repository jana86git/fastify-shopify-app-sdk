import mongoose from 'mongoose';
import AppCredentialsSchema from './schemas/AppCredentials.js';

// Create or get the model
const AppCredentials = mongoose.models.AppCredentials || mongoose.model('AppCredentials', AppCredentialsSchema);

export default AppCredentials;
