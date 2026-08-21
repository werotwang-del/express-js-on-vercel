import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { env } from "@/config/env";
import { v4 as uuidv4 } from "uuid";

export interface TokenPayload extends JwtPayload {
    sub: string; // userId
    email: string;
    role: string;
    jti: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    accessExpiresIn: number;
    refreshExpiresIn: number;
}

function expiresInToSeconds(input: string | number): number {
    if (typeof input === "number") return input;
    const m = /^(\d+)([smhd])$/.exec(input);
    if (!m) return 900;
    const n = parseInt(m[1], 10);
    const unit = m[2];
    return unit === "s" ? n : unit === "m" ? n * 60 : unit === "h" ? n * 3600 : n * 86400;
}

export function signTokenPair(userId: string, email: string, role: string): TokenPair {
    const accessJti = uuidv4();
    const refreshJti = uuidv4();

    const accessPayload: Omit<TokenPayload, "iat" | "exp"> = {
        sub: userId,
        email,
        role,
        jti: accessJti,
        type: "access",
    };
    const refreshPayload: Omit<TokenPayload, "iat" | "exp"> = {
        sub: userId,
        email,
        role,
        jti: refreshJti,
        type: "refresh",
    };

    const accessOptions: SignOptions = {
        expiresIn: env.jwt.accessExpiresIn as SignOptions["expiresIn"],
    };
    const refreshOptions: SignOptions = {
        expiresIn: env.jwt.refreshExpiresIn as SignOptions["expiresIn"],
    };

    const accessToken = jwt.sign(accessPayload, env.jwt.accessSecret, accessOptions);
    const refreshToken = jwt.sign(refreshPayload, env.jwt.refreshSecret, refreshOptions);

    return {
        accessToken,
        refreshToken,
        accessExpiresIn: expiresInToSeconds(env.jwt.accessExpiresIn),
        refreshExpiresIn: expiresInToSeconds(env.jwt.refreshExpiresIn),
    };
}

export function verifyAccess(token: string): TokenPayload {
    return jwt.verify(token, env.jwt.accessSecret) as TokenPayload;
}

export function verifyRefresh(token: string): TokenPayload {
    return jwt.verify(token, env.jwt.refreshSecret) as TokenPayload;
}
