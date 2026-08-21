import { Repository } from "typeorm";
import { AppDataSource } from "../../config/database.js";
import { Cart } from "./cart.entity.js";
import { Book, BookStatus } from "../books/book.entity.js";
import { ApiError } from "../../utils/ApiError.js";

export class CartService {
  private repo: Repository<Cart>;
  private bookRepo: Repository<Book>;

  constructor() {
    this.repo = AppDataSource.getRepository(Cart);
    this.bookRepo = AppDataSource.getRepository(Book);
  }

  async list(userId: string) {
    const items = await this.repo.find({ where: { user: { id: userId } as any } });
    return items;
  }

  async add(userId: string, bookId: string, quantity: number) {
    const book = await this.bookRepo.findOne({ where: { id: bookId } });
    if (!book) throw ApiError.notFound("Book not found");
    if (book.status !== BookStatus.ON_SALE) throw ApiError.badRequest("Book not available");
    if (book.stock < quantity) throw ApiError.badRequest("Insufficient stock");

    let item = await this.repo.findOne({ where: { user: { id: userId } as any, book: { id: bookId } as any } });
    if (item) {
      const newQty = item.quantity + quantity;
      if (newQty > book.stock) throw ApiError.badRequest("Insufficient stock");
      item.quantity = newQty;
    } else {
      item = this.repo.create({
        user: { id: userId } as any,
        book: { id: bookId } as any,
        quantity,
        isSelected: true,
      });
    }
    await this.repo.save(item);
    return item;
  }

  async updateQuantity(userId: string, itemId: string, quantity: number) {
    const item = await this.repo.findOne({ where: { id: itemId, user: { id: userId } as any }, relations: { book: true } });
    if (!item) throw ApiError.notFound("Cart item not found");
    if (quantity <= 0) {
      await this.repo.remove(item);
      return null;
    }
    if (item.book.stock < quantity) throw ApiError.badRequest("Insufficient stock");
    item.quantity = quantity;
    await this.repo.save(item);
    return item;
  }

  async toggleSelected(userId: string, itemId: string, isSelected: boolean) {
    const item = await this.repo.findOne({ where: { id: itemId, user: { id: userId } as any } });
    if (!item) throw ApiError.notFound("Cart item not found");
    item.isSelected = isSelected;
    await this.repo.save(item);
    return item;
  }

  async remove(userId: string, itemId: string) {
    const item = await this.repo.findOne({ where: { id: itemId, user: { id: userId } as any } });
    if (!item) throw ApiError.notFound("Cart item not found");
    await this.repo.remove(item);
  }

  async clearSelected(userId: string) {
    const items = await this.repo.find({ where: { user: { id: userId } as any, isSelected: true } });
    if (items.length) await this.repo.remove(items);
    return items.length;
  }
}

export const cartService = new CartService();
