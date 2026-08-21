import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { addressesService } from "./addresses.service";

const addressSchema = z.object({
    receiverName: z.string().min(1).max(80),
    receiverPhone: z.string().regex(/^\+?\d{6,20}$/),
    region: z.string().min(1).max(80),
    detail: z.string().min(1).max(200),
    postcode: z.string().max(10).optional(),
    isDefault: z.boolean().optional(),
});

export async function list(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await addressesService.list(req.user!.sub);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = addressSchema.parse(req.body);
        const data = await addressesService.create(req.user!.sub, dto);
        res.status(201).json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

export async function update(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = addressSchema.partial().parse(req.body);
        const data = await addressesService.update(req.user!.sub, req.params.id, dto);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
    try {
        await addressesService.remove(req.user!.sub, req.params.id);
        res.json({ success: true, message: "Deleted" });
    } catch (err) {
        next(err);
    }
}
