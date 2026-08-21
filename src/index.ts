import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { initZodI18n } from "./utils/zodI18n.js";
import { env } from "./config/env.js";
import { initDatabase } from "./config/database.js";
import { globalLimiter } from "./middlewares/rateLimiter.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { logger } from "./utils/logger.js";

initZodI18n();

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/users.routes.js";
import categoryRoutes from "./modules/categories/categories.routes.js";
import bookRoutes from "./modules/books/books.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import orderRoutes from "./modules/orders/orders.routes.js";
import addressRoutes from "./modules/addresses/addresses.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";

export function createApp(): Application {
    const app = express();

    app.set("trust proxy", 1);
    app.use(helmet());
    app.use(cors({ origin: env.cors.origin, credentials: true }));
    app.use(compression());
    app.use(express.json({ limit: "1mb" }));
    app.use(express.urlencoded({ extended: true }));
    app.use(
        morgan(env.nodeEnv === "production" ? "combined" : "dev", {
            stream: { write: (msg) => logger.info(msg.trim()) },
        }),
    );
    app.use(async (_req: Request, res: Response, next: NextFunction) => {
        try {
            await initDatabase();
            next();
        } catch (err) {
            next(err);
        }
    });
    app.use(globalLimiter);

    app.get("/health", (_req: Request, res: Response) => {
        res.json({ success: true, data: { status: "ok", service: env.appName, time: new Date().toISOString() } });
    });

    app.get("/", (_req: Request, res: Response) => {
        res.json({
            success: true,
            data: {
                name: env.appName,
                version: "1.0.0",
                docs: "/api",
            },
        });
    });

    // API routes
    app.use("/api/auth", authRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/categories", categoryRoutes);
    app.use("/api/books", bookRoutes);
    app.use("/api/cart", cartRoutes);
    app.use("/api/orders", orderRoutes);
    app.use("/api/addresses", addressRoutes);
    app.use("/api/admin", adminRoutes);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}

export default createApp();
