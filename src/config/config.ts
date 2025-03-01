import dotenv from 'dotenv';

dotenv.config();

export default {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongodbUri: process.env.MONGO_URI
};