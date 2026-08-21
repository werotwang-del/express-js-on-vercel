import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Category } from "@/modules/categories/category.entity";
import { OrderItem } from "@/modules/orders/order.entity";

export enum BookStatus {
    ON_SALE = "on_sale",
    OFF_SALE = "off_sale",
    OUT_OF_STOCK = "out_of_stock",
}

@Entity("books")
export class Book {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Index()
    @Column({ type: "varchar", length: 200 })
    title!: string;

    @Index()
    @Column({ type: "varchar", length: 200 })
    author!: string;

    @Index({ unique: true })
    @Column({ type: "varchar", length: 32, nullable: true })
    isbn?: string;

    @Column({ type: "varchar", length: 120, nullable: true })
    publisher?: string;

    @Column({ type: "date", nullable: true, name: "published_at" })
    publishedAt?: Date;

    @Column({ type: "varchar", length: 500, nullable: true })
    cover?: string;

    @Column({ type: "text", nullable: true })
    description?: string;

    @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
    price!: string;

    @Column({ type: "decimal", precision: 12, scale: 2, default: 0, name: "original_price" })
    originalPrice!: string;

    @Column({ type: "int", default: 0 })
    stock!: number;

    @Column({ type: "int", default: 0 })
    sales!: number;

    @Column({ type: "enum", enum: BookStatus, default: BookStatus.ON_SALE })
    status!: BookStatus;

    @Index()
    @ManyToOne(() => Category, (category) => category.books, {
        onDelete: "SET NULL",
        nullable: true,
    })
    @JoinColumn({ name: "category_id" })
    category?: Category;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;

    @OneToMany(() => OrderItem, (item) => item.book)
    orderItems?: OrderItem[];
}
