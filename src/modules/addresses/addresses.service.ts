import { Repository } from "typeorm";
import { AppDataSource } from "@/config/database";
import { Address } from "./address.entity";
import { ApiError } from "@/utils/ApiError";

export class AddressesService {
    private repo: Repository<Address>;
    constructor() {
        this.repo = AppDataSource.getRepository(Address);
    }

    async list(userId: string) {
        return this.repo.find({ where: { user: { id: userId } as any }, order: { isDefault: "DESC", createdAt: "DESC" } });
    }

    async create(userId: string, input: Omit<Address, "id" | "user" | "createdAt" | "updatedAt" | "isDefault"> & { isDefault?: boolean }) {
        if (input.isDefault) {
            await this.repo.update({ user: { id: userId } as any }, { isDefault: false });
        }
        const addr = this.repo.create({
            ...input,
            user: { id: userId } as any,
            isDefault: input.isDefault ?? false,
        });
        await this.repo.save(addr);
        return addr;
    }

    async update(userId: string, id: string, input: Partial<Omit<Address, "id" | "user" | "createdAt" | "updatedAt">>) {
        const addr = await this.repo.findOne({ where: { id, user: { id: userId } as any } });
        if (!addr) throw ApiError.notFound();
        if (input.isDefault) {
            await this.repo.update({ user: { id: userId } as any }, { isDefault: false });
        }
        Object.assign(addr, input);
        await this.repo.save(addr);
        return addr;
    }

    async remove(userId: string, id: string) {
        const addr = await this.repo.findOne({ where: { id, user: { id: userId } as any } });
        if (!addr) throw ApiError.notFound();
        await this.repo.remove(addr);
    }
}

export const addressesService = new AddressesService();
