import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../users/user.entity.js";
import { Book } from "../books/book.entity.js";

@Entity("cart_items")
export class Cart {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @OneToOne(() => User, (user) => user.cart, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @ManyToOne(() => Book, { eager: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "book_id" })
    book!: Book;

    @Column({ type: "int", default: 1 })
    quantity!: number;

    @Column({ type: "boolean", default: true, name: "is_selected" })
    isSelected!: boolean;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}
