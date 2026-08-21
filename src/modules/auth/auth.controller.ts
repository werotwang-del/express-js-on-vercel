import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await authService.register(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await authService.login(req.body);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await authService.refresh(req.body);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        const header = req.headers.authorization ?? "";
        const accessToken = header.startsWith("Bearer ") ? header.slice(7) : "";
        const refreshToken: string | undefined = req.body?.refreshToken;
        await authService.logout(accessToken, refreshToken);
        res.json({ success: true, message: "Logged out" });
    } catch (err) {
        next(err);
    }
}

export async function me(req: Request, res: Response, next: NextFunction) {
    try {
        res.json({ success: true, data: req.user });
    } catch (err) {
        next(err);
    }
}
