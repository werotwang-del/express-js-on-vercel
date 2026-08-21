import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ordersService } from "./orders.service.js";
import { OrderStatus } from "./order.entity.js";

const createSchema = z.object({
    cartItemIds: z.array(z.string().uuid()).optional(),
    receiverName: z.string().min(1).max(80),
    receiverPhone: z.string().regex(/^\+?\d{6,20}$/),
    receiverAddress: z.string().min(1).max(255),
    remark: z.string().max(500).optional(),
    shippingFee: z.number().min(0).optional(),
});

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = createSchema.parse(req.body);
        const data = await ordersService.create(req.user!.sub, dto);
        res.status(201).json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

export async function list(req: Request, res: Response, next: NextFunction) {
    try {
        const status = req.query.status as OrderStatus | undefined;
        const data = await ordersService.listMine(req.user!.sub, status);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

export async function detail(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await ordersService.detail(req.user!.sub, req.params.id);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

export async function pay(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await ordersService.pay(req.user!.sub, req.params.id);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

export async function cancel(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await ordersService.cancel(req.user!.sub, req.params.id);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
}
