import mongoose from 'mongoose';
import sanitizedConfig from './config';

class Database {
    private static instance: Database;
    private readonly dbURI: string;
    private readonly options: mongoose.ConnectOptions;
    private connected: boolean = false;

    private constructor() {
        this.dbURI = sanitizedConfig.MONGODB_URI || 'mongodb://localhost:27017/shopping-cart';
        this.options = {
            socketTimeoutMS: 3000,
            connectTimeoutMS: 3000,
        };
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async connect(): Promise<void> {
        try {
            await mongoose.connect(this.dbURI, this.options);
            this.connected = true;
            console.log('MongoDB connected successfully');
        } catch (err) {
            console.error('MongoDB connection error:', err);
            process.exit(1);
        }
    }

    public isConnected(): boolean {
        return this.connected; // Return the connection status
    }

    public async disconnect(): Promise<void> {
        try {
            await mongoose.disconnect();
            console.log('MongoDB disconnected successfully');
        } catch (err) {
            console.error('MongoDB disconnection error:', err);
        }
    }
}

export default Database;
