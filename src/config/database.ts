import "reflect-metadata";
import { DataSource } from "typeorm";

import { User } from "@/modules/users/user.entity";
import { Book } from "@/modules/books/book.entity";
import { Category } from "@/modules/categories/category.entity";
import { Cart } from "@/modules/cart/cart.entity";
import { Order, OrderItem } from "@/modules/orders/order.entity";
import { Address } from "@/modules/addresses/address.entity";
import { Token } from "@/modules/auth/token.entity";

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    ssl: true,
    synchronize: false,
    entities: [User, Book, Category, Cart, Order, OrderItem, Address, Token],
    migrations: ["src/migrations/*.ts"],
    migrationsTableName: "migrations",
});

if (!process.argv[1]?.includes("typeorm/cli.js")) {
    await AppDataSource.initialize();
}

export async function initDatabase(): Promise<void> {
    if (AppDataSource.isInitialized) return;
    await AppDataSource.initialize();

    // eslint-disable-next-line no-console
    // console.log(`[db] connected: ${env.db.host}:${env.db.port}/${env.db.database}`);
}
