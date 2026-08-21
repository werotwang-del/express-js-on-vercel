import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppDataSource } from "@/config/database";
import { User } from "./user.entity";
import { ApiError } from "@/utils/ApiError";

const updateSchema = z.object({
    username: z.string().min(3).max(40).optional(),
    phone: z
        .string()
        .regex(/^\+?\d{6,20}$/)
        .optional(),
    avatar: z.string().url().max(255).optional(),
});
export type UpdateMeDto = z.infer<typeof updateSchema>;

export async function me(req: Request, res: Response, next: NextFunction) {
    try {
        const repo = AppDataSource.getRepository(User);
        const user = await repo.findOne({ where: { id: req.user!.sub } });
        if (!user) throw ApiError.notFound("User not found");
        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                username: user.username,
                phone: user.phone,
                avatar: user.avatar,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    } catch (err) {
        next(err);
    }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = updateSchema.parse(req.body);
        const repo = AppDataSource.getRepository(User);
        const user = await repo.findOne({ where: { id: req.user!.sub } });
        if (!user) throw ApiError.notFound();

        if (dto.username && dto.username !== user.username) {
            const taken = await repo.findOne({ where: { username: dto.username } });
            if (taken) throw ApiError.conflict("Username already taken");
            user.username = dto.username;
        }
        if (dto.phone !== undefined) user.phone = dto.phone;
        if (dto.avatar !== undefined) user.avatar = dto.avatar;
        await repo.save(user);
        res.json({ success: true, data: { id: user.id, username: user.username, phone: user.phone, avatar: user.avatar } });
    } catch (err) {
        next(err);
    }
}
