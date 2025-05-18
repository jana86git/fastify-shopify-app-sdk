import mongoose from 'mongoose';
import ShopSchema from './schemas/Shop.js';

// Create or get the model
const Shop = mongoose.models.Shop || mongoose.model('Shop', ShopSchema);

export default Shop; 