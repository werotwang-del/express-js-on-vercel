import "reflect-metadata";
import "pg";
import { DataSource } from "typeorm";

import { User } from "../modules/users/user.entity.js";
import { Book } from "../modules/books/book.entity.js";
import { Category } from "../modules/categories/category.entity.js";
import { Cart } from "../modules/cart/cart.entity.js";
import { Order, OrderItem } from "../modules/orders/order.entity.js";
import { Address } from "../modules/addresses/address.entity.js";
import { Token } from "../modules/auth/token.entity.js";

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    ssl: true,
    synchronize: false,
    entities: [User, Book, Category, Cart, Order, OrderItem, Address, Token],
    migrations: ["src/migrations/*.ts"],
    migrationsTableName: "migrations",
});

let initPromise: Promise<void> | null = null;

export async function initDatabase(): Promise<void> {
    if (AppDataSource.isInitialized) return;
    if (!initPromise) {
        initPromise = AppDataSource.initialize().then(() => undefined);
    }
    await initPromise;
}
