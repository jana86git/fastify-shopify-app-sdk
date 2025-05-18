import mongoose from 'mongoose';

const ShopSchema = new mongoose.Schema({
    shop: { 
        type: String, 
        required: true, 
        unique: true 
    },
    accessToken: { 
        type: String, 
        required: true 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

export default ShopSchema; 