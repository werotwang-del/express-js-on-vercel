function required(key: string, fallback?: string): string {
    const v = process.env[key] ?? fallback;
    if (v === undefined) {
        throw new Error(`Missing required env: ${key}`);
    }
    return v;
}

function num(key: string, fallback: number): number {
    const v = process.env[key];
    return v ? parseInt(v, 10) : fallback;
}

function bool(key: string, fallback: boolean): boolean {
    const v = process.env[key];
    if (v === undefined) return fallback;
    return v.toLowerCase() === "true" || v === "1";
}

export const env = {
    nodeEnv: required("NODE_ENV", "development"),
    port: num("PORT", 3000),
    appName: required("APP_NAME", "bookstore-api"),
    appUrl: required("APP_URL", "http://localhost:3000"),

    // db: {
    //     host: required("DB_HOST", "localhost"),
    //     port: num("DB_PORT", 5432),
    //     username: required("DB_USERNAME", "postgres"),
    //     password: required("DB_PASSWORD", "postgres"),
    //     database: required("DB_DATABASE", "bookstore"),
    //     synchronize: bool("DB_SYNCHRONIZE", true),
    //     logging: bool("DB_LOGGING", false),
    // },

    jwt: {
        accessSecret: required("JWT_ACCESS_SECRET"),
        refreshSecret: required("JWT_REFRESH_SECRET"),
        accessExpiresIn: required("JWT_ACCESS_EXPIRES_IN", "15m"),
        refreshExpiresIn: required("JWT_REFRESH_EXPIRES_IN", "7d"),
    },

    cors: {
        origin: process.env.CORS_ORIGIN || "*",
    },

    rateLimit: {
        windowMs: num("RATE_LIMIT_WINDOW_MS", 60_000),
        max: num("RATE_LIMIT_MAX", 200),
    },
};

export const isProd = env.nodeEnv === "production";
