import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Book } from "@/modules/books/book.entity";

@Entity("categories")
export class Category {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Index({ unique: true })
    @Column({ type: "varchar", length: 80 })
    name!: string;

    @Index({ unique: true })
    @Column({ type: "varchar", length: 80 })
    slug!: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    description?: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    icon?: string;

    @Column({ type: "int", default: 0 })
    sort!: number;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;

    @OneToMany(() => Book, (book) => book.category)
    books?: Book[];
}
