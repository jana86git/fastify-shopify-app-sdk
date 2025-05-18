import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log("process.env.MONGO_URI is ::  --->>>> ", process.env.MONGO_URI);

// MongoDB connection
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    return mongoose.connection;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Export the connection function
export default connectDB; 