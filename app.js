import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import logger from "./src/utils/logger.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 8080;

app.use(helmet());
app.use(cors());


const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW) || 60000,
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 10,
    message: "Too many requests!! Wait for sometime..."
});

app.use("/api", limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({extended: true, limit: "10mb" }))

app.get("/health", (req, res) => {
    res.status(200).json({status: "OK", timestamp: new Date().toISOString()});
})

const startServer = async () => {
    try{
        app.listen(PORT, () => {
            logger.info(`Server is started on ${PORT} in ${process.env.NODE_ENV}`)
        })
    } catch(error) {
        logger.error("Failed to start", error);
        process.exit(1);
    }
}

startServer();

export default app;