import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from "typeorm";

export enum TokenType {
    REFRESH = "refresh",
    BLACKLIST = "blacklist",
}

@Entity("tokens")
export class Token {
    @PrimaryColumn({ type: "varchar", length: 64 })
    jti!: string;

    @Index()
    @Column({ type: "enum", enum: TokenType })
    type!: TokenType;

    @Index()
    @Column({ type: "varchar", length: 64, nullable: true, name: "user_id" })
    userId?: string;

    @Index()
    @Column({ type: "timestamptz", name: "expires_at" })
    expiresAt!: Date;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;
}
