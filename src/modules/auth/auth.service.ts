import { Repository } from "typeorm";
import { AppDataSource } from "@/config/database";
import { User, UserRole } from "@/modules/users/user.entity";
import { ApiError } from "@/utils/ApiError";
import { hashPassword, verifyPassword } from "@/utils/password";
import { blacklistToken, isBlacklisted, isRefreshActive, revokeRefresh, signTokenPair, storeRefresh, verifyAccess, verifyRefresh } from "@/utils/jwt";

import type { LoginDto, RefreshDto, RegisterDto } from "./auth.dto";

interface AuthResult {
    user: {
        id: string;
        email: string;
        username: string;
        role: UserRole;
    };
    tokens: {
        accessToken: string;
        refreshToken: string;
        accessExpiresIn: number;
        refreshExpiresIn: number;
    };
}

export class AuthService {
    private repo: Repository<User>;
    constructor() {
        this.repo = AppDataSource.getRepository(User);
    }

    async register(dto: RegisterDto): Promise<AuthResult> {
        const existing = await this.repo.findOne({
            where: [{ email: dto.email }, { username: dto.username }],
        });
        if (existing) {
            if (existing.email === dto.email) throw ApiError.conflict("Email already registered");
            throw ApiError.conflict("Username already taken");
        }
        const passwordHash = await hashPassword(dto.password);
        const user = this.repo.create({
            email: dto.email,
            username: dto.username,
            passwordHash,
            phone: dto.phone,
            role: UserRole.CUSTOMER,
            isActive: true,
        });
        await this.repo.save(user);
        return this.issue(user);
    }

    async login(dto: LoginDto): Promise<AuthResult> {
        const user = await this.repo.findOne({ where: { email: dto.email } });
        if (!user) throw ApiError.unauthorized("Invalid email or password");
        if (!user.isActive) throw ApiError.forbidden("Account disabled");
        const ok = await verifyPassword(dto.password, user.passwordHash);
        if (!ok) throw ApiError.unauthorized("Invalid email or password");
        return this.issue(user);
    }

    async refresh(dto: RefreshDto): Promise<AuthResult> {
        let payload;
        try {
            payload = verifyRefresh(dto.refreshToken);
        } catch {
            throw ApiError.unauthorized("Invalid refresh token");
        }
        if (payload.type !== "refresh") throw ApiError.unauthorized("Not a refresh token");
        if (await isBlacklisted(payload.jti)) throw ApiError.unauthorized("Token revoked");
        if (!(await isRefreshActive(payload.jti))) throw ApiError.unauthorized("Refresh token expired");

        // rotate: revoke old refresh, issue new pair
        await revokeRefresh(payload.jti);

        const user = await this.repo.findOne({ where: { id: payload.sub } });
        if (!user || !user.isActive) throw ApiError.unauthorized();
        return this.issue(user);
    }

    async logout(accessToken: string, refreshToken?: string): Promise<void> {
        try {
            const payload = verifyAccess(accessToken);
            const ttl = Math.max(payload.exp! - Math.floor(Date.now() / 1000), 1);
            await blacklistToken(payload.jti, ttl);
        } catch {
            /* ignore — access might already be expired */
        }
        if (refreshToken) {
            try {
                const p = verifyRefresh(refreshToken);
                await revokeRefresh(p.jti);
            } catch {
                /* ignore */
            }
        }
    }

    private async issue(user: User): Promise<AuthResult> {
        const tokens = signTokenPair(user.id, user.email, user.role);
        // decode jti from refresh to whitelist it
        const p = verifyRefresh(tokens.refreshToken);
        await storeRefresh(p.jti, user.id, tokens.refreshExpiresIn);
        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
            },
            tokens,
        };
    }
}

export const authService = new AuthService();
