import mongoose from "mongoose"
import logger from "../utils/logger.js";
export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMs: 5000,
            socketTimeoutMs: 45000 
        });
    logger.info(`MongoDb Connected ${conn.connection.host}`);
    return conn;
    } catch (error) {
        logger.error("MongoDb Connection Error", error);
        process.exit(1);
    }
}