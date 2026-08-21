import "reflect-metadata";
import { DataSource } from "typeorm";

import { User } from "@/modules/users/user.entity";
import { Book } from "@/modules/books/book.entity";
import { Category } from "@/modules/categories/category.entity";
import { Cart } from "@/modules/cart/cart.entity";
import { Order, OrderItem } from "@/modules/orders/order.entity";
import { Address } from "@/modules/addresses/address.entity";

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    ssl: true,
    synchronize: false,
    entities: [User, Book, Category, Cart, Order, OrderItem, Address],
    migrations: ["src/migrations/*.ts"],
    migrationsTableName: "migrations",
});

await AppDataSource.initialize();
