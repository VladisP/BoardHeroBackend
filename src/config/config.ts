import { config } from 'dotenv';
import { Pool } from 'pg';
import { createClient, RedisClient } from 'redis';

export class ServerConfig {
    static config: ServerConfig | null = null;

    host: string;
    port: number;
    sessionSecret: string;
    pool: Pool;
    redisClient: RedisClient;

    private constructor() {
        config();

        if (
            !process.env.BH_SERVER_HOST ||
            !process.env.BH_SERVER_PORT ||
            !process.env.DEV_DB_USER ||
            !process.env.DEV_DB_NAME ||
            !process.env.DEV_DB_HOST ||
            !process.env.DEV_DB_PORT ||
            !process.env.SESSION_COOKIE_SECRET ||
            !process.env.REDIS_HOST ||
            !process.env.REDIS_PORT
        ) {
            throw new Error('Please specify all env vars');
        }

        this.host = process.env.BH_SERVER_HOST;
        this.port = Number.parseInt(process.env.BH_SERVER_PORT);
        this.sessionSecret = process.env.SESSION_COOKIE_SECRET;
        this.pool = new Pool({
            user: process.env.DEV_DB_USER,
            database: process.env.DEV_DB_NAME,
            host: process.env.DEV_DB_HOST,
            port: Number.parseInt(process.env.DEV_DB_PORT)
        });
        this.redisClient = createClient(
            Number.parseInt(process.env.REDIS_PORT),
            process.env.REDIS_HOST
        );
    }

    static get(): ServerConfig {
        if (ServerConfig.config === null) {
            ServerConfig.config = new ServerConfig();
        }

        return ServerConfig.config;
    }
}