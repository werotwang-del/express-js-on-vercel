import { Repository, Like, FindOptionsWhere } from "typeorm";
import { AppDataSource } from "@/config/database";
import { Book, BookStatus } from "./book.entity";
import { ApiError } from "@/utils/ApiError";

export interface BookListQuery {
    page?: number;
    pageSize?: number;
    keyword?: string;
    categoryId?: string;
    status?: BookStatus;
    sortBy?: "newest" | "sales" | "price_asc" | "price_desc";
}

export class BooksService {
    private repo: Repository<Book>;
    constructor() {
        this.repo = AppDataSource.getRepository(Book);
    }

    async list(q: BookListQuery) {
        const page = Math.max(1, q.page ?? 1);
        const pageSize = Math.min(100, Math.max(1, q.pageSize ?? 20));

        const where: FindOptionsWhere<Book> = {};
        if (q.categoryId) where.category = { id: q.categoryId };
        if (q.status) where.status = q.status;
        else where.status = BookStatus.ON_SALE;
        if (q.keyword) {
            where.title = Like(`%${q.keyword}%`);
        }

        const order: any = { createdAt: "DESC" };
        if (q.sortBy === "sales") order.sales = "DESC";
        else if (q.sortBy === "price_asc") order.price = "ASC";
        else if (q.sortBy === "price_desc") order.price = "DESC";

        const [items, total] = await this.repo.findAndCount({
            where,
            order,
            skip: (page - 1) * pageSize,
            take: pageSize,
            relations: { category: true },
        });

        const result = { items, total, page, pageSize };
        return result;
    }

    async getById(id: string): Promise<Book> {
        const book = await this.repo.findOne({ where: { id }, relations: { category: true } });
        if (!book) throw ApiError.notFound("Book not found");

        return book;
    }

    async create(input: Partial<Book> & { categoryId?: string }): Promise<Book> {
        const { categoryId, ...rest } = input;
        const book = this.repo.create({
            ...rest,
            price: rest.price ?? "0",
            originalPrice: rest.originalPrice ?? rest.price ?? "0",
            stock: rest.stock ?? 0,
            status: rest.status ?? BookStatus.ON_SALE,
        });
        if (categoryId) book.category = { id: categoryId } as any;
        await this.repo.save(book);
        return this.getById(book.id);
    }

    async update(id: string, input: Partial<Book> & { categoryId?: string }): Promise<Book> {
        const book = await this.getById(id);
        const { categoryId, ...rest } = input;
        Object.assign(book, rest);
        if (categoryId) book.category = { id: categoryId } as any;
        await this.repo.save(book);
        return this.getById(id);
    }

    async remove(id: string): Promise<void> {
        const book = await this.getById(id);
        await this.repo.remove(book);
    }

    async decrementStock(id: string, qty: number, manager = AppDataSource.manager): Promise<void> {
        const res = await manager
            .createQueryBuilder()
            .update(Book)
            .set({ stock: () => `stock - ${qty}`, sales: () => `sales + ${qty}` })
            .where("id = :id AND stock >= :qty", { id, qty })
            .execute();
        if ((res.affected ?? 0) === 0) {
            throw ApiError.conflict("Insufficient stock");
        }
    }
}

export const booksService = new BooksService();
