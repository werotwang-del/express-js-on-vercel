import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";
import { formatZodError } from "../utils/zodError.js";
import { logger } from "../utils/logger.js";
import { isProd } from "../config/env.js";

export function notFoundHandler(req: Request, res: Response, _next: NextFunction) {
    res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction,
) {
    if (err instanceof ZodError) {
        res.status(400).json({
            success: false,
            code: "BAD_REQUEST",
            message: "请求参数校验失败",
            details: formatZodError(err),
        });
        return;
    }

    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            success: false,
            code: err.code,
            message: err.message,
            ...(err.details ? { details: err.details } : {}),
        });
        return;
    }

    // TypeORM unique violation
    if ((err as any).code === "23505") {
        res.status(409).json({
            success: false,
            code: "DUPLICATE_KEY",
            message: "Resource already exists",
            details: (err as any).detail,
        });
        return;
    }

    logger.error(`[unhandled] ${err.stack || err.message}`);
    res.status(500).json({
        success: false,
        code: "INTERNAL_ERROR",
        message: isProd ? "Internal server error" : err.message,
        ...(isProd ? {} : { stack: err.stack }),
    });
}
