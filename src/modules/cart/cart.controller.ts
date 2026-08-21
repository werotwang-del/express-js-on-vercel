import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { cartService } from "./cart.service";

const addSchema = z.object({
    bookId: z.string().uuid(),
    quantity: z.number().int().min(1).max(999),
});
const updateSchema = z.object({
    quantity: z.number().int().min(0).max(999),
});
const selectSchema = z.object({
    isSelected: z.boolean(),
});

export async function list(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await cartService.list(req.user!.sub);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

export async function add(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = addSchema.parse(req.body);
        const data = await cartService.add(req.user!.sub, dto.bookId, dto.quantity);
        res.status(201).json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

export async function update(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = updateSchema.parse(req.body);
        const data = await cartService.updateQuantity(req.user!.sub, req.params.id, dto.quantity);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

export async function select(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = selectSchema.parse(req.body);
        const data = await cartService.toggleSelected(req.user!.sub, req.params.id, dto.isSelected);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
    try {
        await cartService.remove(req.user!.sub, req.params.id);
        res.json({ success: true, message: "Removed" });
    } catch (err) {
        next(err);
    }
}
