import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
// import { env } from "@/config/env";
import { globalLimiter } from "@/middlewares/rateLimiter";
import { errorHandler, notFoundHandler } from "@/middlewares/errorHandler";
import { logger } from "@/utils/logger";

import authRoutes from "@/modules/auth/auth.routes";
import userRoutes from "@/modules/users/users.routes";
import categoryRoutes from "@/modules/categories/categories.routes";
import bookRoutes from "@/modules/books/books.routes";
import cartRoutes from "@/modules/cart/cart.routes";
import orderRoutes from "@/modules/orders/orders.routes";
import addressRoutes from "@/modules/addresses/addresses.routes";
import adminRoutes from "@/modules/admin/admin.routes";

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
