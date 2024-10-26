import Redis from "ioredis";

class RedisClient {
    private static instance: RedisClient;
    private client: Redis;

    private constructor() {
        const redisHost = process.env.REDIS_HOST || '127.0.0.1';
        const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

        this.client = new Redis({
            host: redisHost,
            port: redisPort,
        });

        this.client.on('connect', () => {
            console.log('Redis connected');
        });

        this.client.on('error', (err) => {
            console.error('Redis error:', err);
        });
    }

    public static getInstance(): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }

    public async connect(): Promise<void> {
        try {
            console.log('Connecting to Redis...');
            // The Redis client connects automatically, but you can handle this if needed
        } catch (err) {
            console.error('Redis connection error:', err);
        }
    }

    public async disconnect(): Promise<void> {
        try {
            await this.client.quit();
            console.log('Redis disconnected');
        } catch (err) {
            console.error('Redis disconnection error:', err);
        }
    }

    public async get(key: string): Promise<string | null> {
        try {
            return await this.client.get(key);
        } catch (err) {
            console.error('Error fetching from Redis:', err);
            return null;
        }
    }

    public async del(key: string) {
        try {
            await this.client.del(key);
        } catch (err) {
            console.error('Error deleting from Redis:', err);
            return null;
        }
    }

    public async set(key: string, value: string, expirationSeconds?: number): Promise<void> {
        try {
            if (expirationSeconds) {
                await this.client.set(key, value, 'EX', expirationSeconds); // Sets with expiration time
            } else {
                await this.client.set(key, value); // Sets without expiration
            }
        } catch (err) {
            console.error('Error setting value in Redis:', err);
        }
    }

    public getClient(): Redis {
        return this.client;
    }
}

export default RedisClient;
