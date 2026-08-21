import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { categoriesService } from "./categories.service.js";

const createSchema = z.object({
    name: z.string().min(1).max(80),
    slug: z
        .string()
        .min(1)
        .max(80)
        .regex(/^[a-z0-9-]+$/),
    description: z.string().max(255).optional(),
    icon: z.string().url().optional(),
    sort: z.number().int().optional(),
});
const updateSchema = createSchema.partial();

export async function list(_req: Request, res: Response, next: NextFunction) {
    try {
        const data = await categoriesService.list();
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

export async function detail(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await categoriesService.getById(req.params.id);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = createSchema.parse(req.body);
        const data = await categoriesService.create(dto);
        res.status(201).json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

export async function update(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = updateSchema.parse(req.body);
        const data = await categoriesService.update(req.params.id, dto);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
    try {
        await categoriesService.remove(req.params.id);
        res.json({ success: true, message: "Deleted" });
    } catch (err) {
        next(err);
    }
}
