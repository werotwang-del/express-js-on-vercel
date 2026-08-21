import { Request, Response, NextFunction } from "express";
import { ApiError } from "@/utils/ApiError";
import { isBlacklisted, verifyAccess } from "@/utils/jwt";

export async function authRequired(req: Request, _res: Response, next: NextFunction) {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith("Bearer ")) {
            throw ApiError.unauthorized("Missing bearer token");
        }
        const token = header.slice("Bearer ".length).trim();
        let payload;
        try {
            payload = verifyAccess(token);
        } catch {
            throw ApiError.unauthorized("Invalid or expired token");
        }
        if (await isBlacklisted(payload.jti)) {
            throw ApiError.unauthorized("Token revoked");
        }
        req.user = payload;
        next();
    } catch (err) {
        next(err);
    }
}

export function requireRole(...roles: string[]) {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) return next(ApiError.unauthorized());
        if (!roles.includes(req.user.role)) return next(ApiError.forbidden("Insufficient role"));
        next();
    };
}
