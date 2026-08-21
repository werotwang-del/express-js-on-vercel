import { Repository } from "typeorm";
import { AppDataSource } from "../../config/database.js";
import { Order, OrderItem, OrderStatus } from "./order.entity.js";
import { Cart } from "../cart/cart.entity.js";
import { Book } from "../books/book.entity.js";
import { ApiError } from "../../utils/ApiError.js";

interface CreateOrderInput {
    cartItemIds?: string[]; // specific items; if empty, use all selected
    receiverName: string;
    receiverPhone: string;
    receiverAddress: string;
    remark?: string;
    shippingFee?: number;
}

function genOrderNo(): string {
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `${ymd}${rand}`;
}

export class OrdersService {
    private orderRepo: Repository<Order>;
    private cartRepo: Repository<Cart>;
    private bookRepo: Repository<Book>;

    constructor() {
        this.orderRepo = AppDataSource.getRepository(Order);
        this.cartRepo = AppDataSource.getRepository(Cart);
        this.bookRepo = AppDataSource.getRepository(Book);
    }

    async create(userId: string, input: CreateOrderInput): Promise<Order> {
        return AppDataSource.transaction(async (manager) => {
            const qb = manager.createQueryBuilder(Cart, "c").leftJoinAndSelect("c.book", "b").where("c.user_id = :userId", { userId });

            if (input.cartItemIds && input.cartItemIds.length > 0) {
                qb.andWhere("c.id IN (:...ids)", { ids: input.cartItemIds });
            } else {
                qb.andWhere("c.is_selected = true");
            }

            const items = await qb.getMany();
            if (items.length === 0) throw ApiError.badRequest("No cart items to checkout");

            let total = 0;
            const orderItems: OrderItem[] = [];

            for (const ci of items) {
                if (!ci.book || ci.book.status !== "on_sale") {
                    throw ApiError.badRequest(`Book "${ci.book?.title}" is no longer available`);
                }
                if (ci.book.stock < ci.quantity) {
                    throw ApiError.badRequest(`Insufficient stock for "${ci.book.title}"`);
                }
                // optimistic-ish decrement via SQL with stock check
                const upd = await manager
                    .createQueryBuilder()
                    .update(Book)
                    .set({ stock: () => `stock - ${ci.quantity}`, sales: () => `sales + ${ci.quantity}` })
                    .where("id = :id AND stock >= :qty", { id: ci.book.id, qty: ci.quantity })
                    .execute();
                if ((upd.affected ?? 0) === 0) {
                    throw ApiError.conflict(`Stock changed for "${ci.book.title}", please retry`);
                }
                const price = ci.book.price;
                const subtotal = (Number(price) * ci.quantity).toFixed(2);
                total += Number(subtotal);
                orderItems.push(
                    manager.create(OrderItem, {
                        book: { id: ci.book.id } as any,
                        bookTitle: ci.book.title,
                        bookAuthor: ci.book.author,
                        bookCover: ci.book.cover,
                        price,
                        quantity: ci.quantity,
                        subtotal,
                    }),
                );
            }

            const order = manager.create(Order, {
                orderNo: genOrderNo(),
                user: { id: userId } as any,
                total: total.toFixed(2),
                shippingFee: (input.shippingFee ?? 0).toFixed(2),
                receiverName: input.receiverName,
                receiverPhone: input.receiverPhone,
                receiverAddress: input.receiverAddress,
                remark: input.remark,
                status: OrderStatus.PENDING,
                items: orderItems,
            });
            await manager.save(order);

            // clear those cart rows
            await manager
                .createQueryBuilder()
                .delete()
                .from(Cart)
                .where("id IN (:...ids)", { ids: items.map((i) => i.id) })
                .execute();

            return order;
        });
    }

    async listMine(userId: string, status?: OrderStatus) {
        const where: any = { user: { id: userId } as any };
        if (status) where.status = status;
        return this.orderRepo.find({
            where,
            order: { createdAt: "DESC" },
            take: 100,
        });
    }

    async detail(userId: string, id: string, isAdmin = false) {
        const order = await this.orderRepo.findOne({
            where: { id },
            relations: { items: true, user: true },
        });
        if (!order) throw ApiError.notFound();
        if (!isAdmin && order.user.id !== userId) throw ApiError.forbidden();
        return order;
    }

    async pay(userId: string, id: string) {
        const order = await this.detail(userId, id);
        if (order.status !== OrderStatus.PENDING) {
            throw ApiError.badRequest(`Order is ${order.status}, cannot pay`);
        }
        // In real world: integrate payment gateway here.
        order.status = OrderStatus.PAID;
        await this.orderRepo.save(order);
        return order;
    }

    async cancel(userId: string, id: string) {
        return AppDataSource.transaction(async (manager) => {
            const order = await manager.findOne(Order, { where: { id }, relations: { items: true } });
            if (!order) throw ApiError.notFound();
            if (order.user.id !== userId) throw ApiError.forbidden();
            if (![OrderStatus.PENDING, OrderStatus.PAID].includes(order.status)) {
                throw ApiError.badRequest(`Cannot cancel order in ${order.status} status`);
            }
            // restore stock
            for (const it of order.items) {
                await manager
                    .createQueryBuilder()
                    .update(Book)
                    .set({ stock: () => `stock + ${it.quantity}`, sales: () => `GREATEST(sales - ${it.quantity}, 0)` })
                    .where("id = :id", { id: it.book.id })
                    .execute();
            }
            order.status = OrderStatus.CANCELLED;
            await manager.save(order);
            return order;
        });
    }

    async updateStatus(id: string, status: OrderStatus) {
        const order = await this.orderRepo.findOne({ where: { id } });
        if (!order) throw ApiError.notFound();
        order.status = status;
        await this.orderRepo.save(order);
        return order;
    }
}

export const ordersService = new OrdersService();
