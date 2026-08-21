import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "@/modules/users/user.entity";
import { Book } from "@/modules/books/book.entity";

export enum OrderStatus {
    PENDING = "pending", // created, awaiting payment
    PAID = "paid", // paid, awaiting shipment
    SHIPPED = "shipped", // shipped
    COMPLETED = "completed", // received
    CANCELLED = "cancelled",
    REFUNDED = "refunded",
}

@Entity("orders")
export class Order {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Index({ unique: true })
    @Column({ type: "varchar", length: 32, name: "order_no" })
    orderNo!: string;

    @ManyToOne(() => User, (user) => user.orders, { onDelete: "RESTRICT" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
    total!: string;

    @Column({ type: "decimal", precision: 12, scale: 2, default: 0, name: "shipping_fee" })
    shippingFee!: string;

    @Column({ type: "varchar", length: 80, nullable: true, name: "receiver_name" })
    receiverName?: string;

    @Column({ type: "varchar", length: 20, nullable: true, name: "receiver_phone" })
    receiverPhone?: string;

    @Column({ type: "varchar", length: 255, nullable: true, name: "receiver_address" })
    receiverAddress?: string;

    @Column({ type: "text", nullable: true })
    remark?: string;

    @Index()
    @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.PENDING })
    status!: OrderStatus;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;

    @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
    items!: OrderItem[];
}

@Entity("order_items")
export class OrderItem {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
    @JoinColumn({ name: "order_id" })
    order!: Order;

    @ManyToOne(() => Book, { eager: true, onDelete: "RESTRICT" })
    @JoinColumn({ name: "book_id" })
    book!: Book;

    // snapshot fields in case book info changes later
    @Column({ type: "varchar", length: 200, name: "book_title" })
    bookTitle!: string;

    @Column({ type: "varchar", length: 200, name: "book_author" })
    bookAuthor!: string;

    @Column({ type: "varchar", length: 500, nullable: true, name: "book_cover" })
    bookCover?: string;

    @Column({ type: "decimal", precision: 12, scale: 2 })
    price!: string;

    @Column({ type: "int" })
    quantity!: number;

    @Column({ type: "decimal", precision: 12, scale: 2, name: "subtotal" })
    subtotal!: string;
}
