import "reflect-metadata";
import express from "express";
import Database from "./config/db";
import RedisClient from "./config/redisClient";
import { corsOptions } from "./utils";
import cors from "cors";
import { ProductRoutes } from "./routes/products";
import { CartRoutes } from "./routes/cart";
import sanitizedConfig from "./config/config";
import { errorResponse } from "./dtos/response.dto";

export default class Server {
    private app: express.Application
    private db: Database;
    private redis: RedisClient;

    constructor() {
        this.app = express();
        this.config();
        this.routes();
        this.db = Database.getInstance();
        this.redis = RedisClient.getInstance();
    }

    public getApp(): express.Application {
        return this.app;
    }

    private config(): void {
        this.app.use(cors(corsOptions))
        this.app.set("port", sanitizedConfig.PORT || 3000)
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }))
    }

    private routes(): void {
        this.app.use("/api/products", new ProductRoutes().router)
        this.app.use("/api/carts", new CartRoutes().router)
        this.app.use((req, res, next) => {
            errorResponse(res, "Page Not Found", 'Page Not Found', 404);
        });
    }

    public async start(): Promise<void> {
        try {
            // Connect to MongoDB
            await this.db.connect();

            // Check if MongoDB is connected
            if (!this.db.isConnected()) {
                console.error('Failed to connect to MongoDB. Shutting down server.');
                process.exit(1);
            }

            // Connect to Redis
            await this.redis.connect();

            // Check if Redis is connected
            if (!this.redis.getClient().status) {
                console.error('Failed to connect to Redis. Shutting down server.');
                process.exit(1);
            }

            // Start the Express server
            this.app.listen(this.app.get('port'), () => {
                console.log(' 🟢 API is running on port %d', this.app.get('port'))
            });

            this.gracefulShutdown();
        } catch (err) {
            console.error('Error starting server:', err);
        }
    }

    private gracefulShutdown(): void {
        process.on('SIGTERM', async () => {
            console.log('SIGTERM signal received: closing HTTP server');
            await this.shutdown();
        });

        process.on('SIGINT', async () => {
            console.log('SIGINT signal received: closing HTTP server');
            await this.shutdown();
        });
    }

    // Disconnect from DB and Redis when shutting down
    private async shutdown(): Promise<void> {
        try {
            await this.db.disconnect();
            await this.redis.disconnect();
            process.exit(0);
        } catch (err) {
            console.error('Error during shutdown:', err);
            process.exit(1);
        }
    }
}
