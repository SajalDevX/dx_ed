import mongoose from 'mongoose';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

export const connectDatabase = async (retries = 3): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(config.mongoUri);
      logger.info(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      logger.error(`MongoDB connection attempt ${attempt}/${retries} failed:`, error);
      if (attempt === retries) {
        logger.error('All MongoDB connection attempts failed. Please check your MONGODB_URI in .env');
        logger.error('Make sure your MongoDB Atlas user has the correct password and IP whitelist is configured.');
        throw new Error('MongoDB connection failed after all retries');
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB error:', err);
});

export default connectDatabase;
