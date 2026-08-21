import rateLimit from "express-rate-limit";
import { env } from "@/config/env";

export const globalLimiter = rateLimit({
    windowMs: env.rateLimit.windowMs,
    max: env.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        code: "RATE_LIMITED",
        message: "Too many requests, please try again later.",
    },
});

export const authLimiter = rateLimit({
    windowMs: 60_000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        code: "RATE_LIMITED",
        message: "Too many auth attempts, please slow down.",
    },
});
