import path from 'path';
import dotenv from 'dotenv';

const envPath = path.join(__dirname, "../../", `.env`);
process.env.DOTENV_CONFIG_PATH = envPath;
dotenv.config({
    path: envPath,
});

interface ENV {
    PORT: number | undefined;
    MONGODB_URI: string | undefined;
    REDIS_HOST: string | undefined;
    REDIS_PORT: string | undefined;
    REDIS_PASSWORD: string | undefined;
}

interface Config {
    PORT: number;
    MONGODB_URI: string;
    REDIS_HOST: string;
    REDIS_PORT: string;
    REDIS_PASSWORD: string;
}

const getConfig = (): ENV => {
    return {
        PORT: process.env.PORT ? Number(process.env.PORT) : undefined,
        MONGODB_URI: process.env.MONGODB_URI,
        REDIS_HOST: process.env.REDIS_HOST,
        REDIS_PORT: process.env.REDIS_PORT,
        REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    };
};

const getSanitzedConfig = (config: ENV): Config => {
    for (const [key, value] of Object.entries(config)) {
        if (value === undefined) {
            throw new Error(`Missing key ${key} in config.env`);
        }
    }
    return config as Config;
};

const config = getConfig();

const sanitizedConfig = getSanitzedConfig(config);

export default sanitizedConfig;