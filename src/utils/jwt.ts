import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { MoreThan } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { AppDataSource } from "@/config/database";
import { env } from "@/config/env";
import { Token, TokenType } from "@/modules/auth/token.entity";

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

export async function storeRefresh(jti: string, userId: string, ttlSeconds: number): Promise<void> {
    await AppDataSource.getRepository(Token).save(
        AppDataSource.getRepository(Token).create({
            jti,
            userId,
            type: TokenType.REFRESH,
            expiresAt: new Date(Date.now() + ttlSeconds * 1000),
        }),
    );
}

export async function isRefreshActive(jti: string): Promise<boolean> {
    const count = await AppDataSource.getRepository(Token).count({
        where: { jti, type: TokenType.REFRESH, expiresAt: MoreThan(new Date()) },
    });
    return count > 0;
}

export async function revokeRefresh(jti: string): Promise<void> {
    await AppDataSource.getRepository(Token).delete({ jti, type: TokenType.REFRESH });
}

export async function blacklistToken(jti: string, ttlSeconds: number): Promise<void> {
    await AppDataSource.getRepository(Token).save(
        AppDataSource.getRepository(Token).create({
            jti,
            type: TokenType.BLACKLIST,
            expiresAt: new Date(Date.now() + ttlSeconds * 1000),
        }),
    );
}

export async function isBlacklisted(jti: string): Promise<boolean> {
    const count = await AppDataSource.getRepository(Token).count({
        where: { jti, type: TokenType.BLACKLIST, expiresAt: MoreThan(new Date()) },
    });
    return count > 0;
}
