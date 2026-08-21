import { Column, CreateDateColumn, Entity, Index, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Cart } from "@/modules/cart/cart.entity";
import { Order } from "@/modules/orders/order.entity";
import { Address } from "@/modules/addresses/address.entity";

export enum UserRole {
    ADMIN = "admin",
    CUSTOMER = "customer",
}

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Index({ unique: true })
    @Column({ type: "varchar", length: 120 })
    email!: string;

    @Column({ type: "varchar", length: 80 })
    username!: string;

    @Column({ type: "varchar", length: 120, name: "password_hash" })
    passwordHash!: string;

    @Column({ type: "varchar", length: 20, nullable: true })
    phone?: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    avatar?: string;

    @Column({ type: "enum", enum: UserRole, default: UserRole.CUSTOMER })
    role!: UserRole;

    @Column({ type: "boolean", default: true, name: "is_active" })
    isActive!: boolean;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;

    @OneToOne(() => Cart, (cart) => cart.user)
    cart?: Cart;

    @OneToMany(() => Order, (order) => order.user)
    orders?: Order[];

    @OneToMany(() => Address, (address) => address.user)
    addresses?: Address[];
}
