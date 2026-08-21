import { Router } from "express";
import { authRequired, requireRole } from "@/middlewares/auth";
import { AppDataSource } from "@/config/database";
import { User } from "@/modules/users/user.entity";
import { Book } from "@/modules/books/book.entity";
import { Order, OrderStatus } from "@/modules/orders/order.entity";

const router = Router();
router.use(authRequired, requireRole("admin"));

router.get("/stats", async (_req, res, next) => {
    try {
        const [userCount, bookCount, orderCount, paidCount] = await Promise.all([AppDataSource.getRepository(User).count(), AppDataSource.getRepository(Book).count(), AppDataSource.getRepository(Order).count(), AppDataSource.getRepository(Order).count({ where: { status: OrderStatus.PAID } })]);
        const revenue = await AppDataSource.getRepository(Order)
            .createQueryBuilder("o")
            .select("COALESCE(SUM(o.total::numeric), 0)", "sum")
            .where("o.status IN (:...statuses)", { statuses: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.COMPLETED] })
            .getRawOne<{ sum: string }>();

        res.json({
            success: true,
            data: {
                userCount,
                bookCount,
                orderCount,
                paidCount,
                revenue: Number(revenue?.sum ?? 0).toFixed(2),
            },
        });
    } catch (err) {
        next(err);
    }
});

router.get("/users", async (_req, res, next) => {
    try {
        const data = await AppDataSource.getRepository(User).find({
            order: { createdAt: "DESC" },
            take: 100,
            select: { id: true, email: true, username: true, role: true, isActive: true, createdAt: true },
        });
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
});

router.patch("/users/:id/toggle", async (req, res, next) => {
    try {
        const repo = AppDataSource.getRepository(User);
        const user = await repo.findOne({ where: { id: req.params.id } });
        if (!user) return res.status(404).json({ success: false, code: "NOT_FOUND", message: "User not found" });
        user.isActive = !user.isActive;
        await repo.save(user);
        res.json({ success: true, data: { id: user.id, isActive: user.isActive } });
    } catch (err) {
        next(err);
    }
});

export default router;
