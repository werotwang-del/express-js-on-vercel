import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { booksService } from "./books.service.js";
import { BookStatus } from "./book.entity.js";

export const listQuerySchema = z.object({
    page: z.coerce.number().int().min(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).optional(),
    keyword: z.string().max(200).optional(),
    categoryId: z.string().uuid().optional(),
    status: z.nativeEnum(BookStatus).optional(),
    sortBy: z.enum(["newest", "sales", "price_asc", "price_desc"]).optional(),
});

const bookBodySchema = z.object({
    title: z.string().min(1).max(200),
    author: z.string().min(1).max(200),
    isbn: z.string().max(32).optional(),
    publisher: z.string().max(120).optional(),
    publishedAt: z
        .union([z.string().datetime(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)])
        .optional()
        .transform((v) => (v ? new Date(v) : undefined)),
    cover: z.string().url().optional(),
    description: z.string().max(10_000).optional(),
    price: z.union([z.string(), z.number()]).transform((v) => String(v)),
    originalPrice: z
        .union([z.string(), z.number()])
        .optional()
        .transform((v) => (v === undefined ? undefined : String(v))),
    stock: z.number().int().min(0).optional(),
    status: z.nativeEnum(BookStatus).optional(),
    categoryId: z.string().uuid().optional(),
});

export async function list(req: Request, res: Response, next: NextFunction) {
    try {
        const q = listQuerySchema.parse(req.query);
        const data = await booksService.list(q);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

export async function detail(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await booksService.getById(req.params.id);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = bookBodySchema.parse(req.body);
        const data = await booksService.create(dto);
        res.status(201).json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

export async function update(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = bookBodySchema.partial().parse(req.body);
        const data = await booksService.update(req.params.id, dto);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
    try {
        await booksService.remove(req.params.id);
        res.json({ success: true, message: "Deleted" });
    } catch (err) {
        next(err);
    }
}
