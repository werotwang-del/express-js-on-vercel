import { Repository } from "typeorm";
import { AppDataSource } from "../../config/database.js";
import { Category } from "./category.entity.js";
import { ApiError } from "../../utils/ApiError.js";

export class CategoriesService {
    private repo: Repository<Category>;
    constructor() {
        this.repo = AppDataSource.getRepository(Category);
    }

    async list(): Promise<Category[]> {
        const data = await this.repo.find({ order: { sort: "ASC", createdAt: "ASC" } });

        return data;
    }

    async getById(id: string): Promise<Category> {
        const cat = await this.repo.findOne({ where: { id } });
        if (!cat) throw ApiError.notFound("Category not found");
        return cat;
    }

    async create(input: { name: string; slug: string; description?: string; icon?: string; sort?: number }): Promise<Category> {
        const exists = await this.repo.findOne({ where: [{ name: input.name }, { slug: input.slug }] });
        if (exists) throw ApiError.conflict("Category name or slug already exists");
        const cat = this.repo.create({ ...input, sort: input.sort ?? 0 });
        await this.repo.save(cat);
        return cat;
    }

    async update(id: string, input: Partial<{ name: string; slug: string; description: string; icon: string; sort: number }>): Promise<Category> {
        const cat = await this.getById(id);
        Object.assign(cat, input);
        await this.repo.save(cat);
        return cat;
    }

    async remove(id: string): Promise<void> {
        const cat = await this.getById(id);
        await this.repo.remove(cat);
    }
}

export const categoriesService = new CategoriesService();
