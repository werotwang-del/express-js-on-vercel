import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../users/user.entity.js";

@Entity("addresses")
export class Address {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Index()
    @ManyToOne(() => User, (user) => user.addresses, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ type: "varchar", length: 80, name: "receiver_name" })
    receiverName!: string;

    @Column({ type: "varchar", length: 20, name: "receiver_phone" })
    receiverPhone!: string;

    @Column({ type: "varchar", length: 80 })
    region!: string;

    @Column({ type: "varchar", length: 200 })
    detail!: string;

    @Column({ type: "varchar", length: 10, nullable: true })
    postcode?: string;

    @Column({ type: "boolean", default: false, name: "is_default" })
    isDefault!: boolean;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}
