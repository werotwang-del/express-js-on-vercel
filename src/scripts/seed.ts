import "reflect-metadata";
import { AppDataSource, initDatabase } from "@/config/database";
import { User, UserRole } from "@/modules/users/user.entity";
import { Category } from "@/modules/categories/category.entity";
import { Book, BookStatus } from "@/modules/books/book.entity";
import { hashPassword } from "@/utils/password";
import { logger } from "@/utils/logger";

async function main() {
    await initDatabase();

    // ---- Users
    const userRepo = AppDataSource.getRepository(User);
    let admin = await userRepo.findOne({ where: { email: "admin@bookstore.dev" } });
    if (!admin) {
        admin = await userRepo.save(
            userRepo.create({
                email: "admin@bookstore.dev",
                username: "admin",
                passwordHash: await hashPassword("Admin@123"),
                role: UserRole.ADMIN,
                isActive: true,
            }),
        );
        logger.info(`[seed] admin created: ${admin.email} / Admin@123`);
    }
    let demo = await userRepo.findOne({ where: { email: "demo@bookstore.dev" } });
    if (!demo) {
        demo = await userRepo.save(
            userRepo.create({
                email: "demo@bookstore.dev",
                username: "demo",
                passwordHash: await hashPassword("Demo@123"),
                role: UserRole.CUSTOMER,
                isActive: true,
            }),
        );
        logger.info(`[seed] demo user created: ${demo.email} / Demo@123`);
    }

    // ---- Categories
    const catRepo = AppDataSource.getRepository(Category);
    const catData = [
        { name: "Literature", slug: "literature", description: "Literary fiction & classics", sort: 1 },
        { name: "Tech", slug: "tech", description: "Programming & software", sort: 2 },
        { name: "Business", slug: "business", description: "Business & economics", sort: 3 },
        { name: "Kids", slug: "kids", description: "Children's books", sort: 4 },
    ];
    const cats: Category[] = [];
    for (const c of catData) {
        let cat = await catRepo.findOne({ where: { slug: c.slug } });
        if (!cat) cat = await catRepo.save(catRepo.create(c));
        cats.push(cat);
    }

    // ---- Books
    const bookRepo = AppDataSource.getRepository(Book);
    const existing = await bookRepo.count();
    if (existing === 0) {
        const books: Array<Partial<Book> & { category: Category }> = [
            { title: "The Pragmatic Programmer", author: "Andrew Hunt", isbn: "9780201616224", publisher: "Addison-Wesley", price: "49.99", originalPrice: "59.99", stock: 50, sales: 120, description: "From journeyman to master.", category: cats[1] },
            { title: "Clean Code", author: "Robert C. Martin", isbn: "9780132350884", publisher: "Prentice Hall", price: "45.00", originalPrice: "55.00", stock: 80, sales: 200, description: "A handbook of agile software craftsmanship.", category: cats[1] },
            { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", isbn: "9781449373320", publisher: "O'Reilly", price: "68.00", originalPrice: "78.00", stock: 40, sales: 90, description: "The big ideas behind reliable, scalable, maintainable systems.", category: cats[1] },
            { title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "9780061120084", publisher: "Harper", price: "15.99", originalPrice: "18.99", stock: 120, sales: 300, description: "A classic of modern American literature.", category: cats[0] },
            { title: "1984", author: "George Orwell", isbn: "9780451524935", publisher: "Signet Classics", price: "12.50", originalPrice: "15.50", stock: 200, sales: 420, description: "A dystopian social science fiction novel.", category: cats[0] },
            { title: "The Lean Startup", author: "Eric Ries", isbn: "9780307887894", publisher: "Crown Business", price: "22.00", originalPrice: "28.00", stock: 60, sales: 110, description: "How today's entrepreneurs use continuous innovation.", category: cats[2] },
            { title: "Good to Great", author: "Jim Collins", isbn: "9780066620992", publisher: "HarperBusiness", price: "24.00", originalPrice: "30.00", stock: 70, sales: 95, description: "Why some companies make the leap and others don't.", category: cats[2] },
            { title: "Charlotte's Web", author: "E. B. White", isbn: "9780064400558", publisher: "HarperCollins", price: "9.99", originalPrice: "12.99", stock: 150, sales: 250, description: "A beloved children's classic.", category: cats[3] },
        ];
        for (const b of books) {
            await bookRepo.save(bookRepo.create({ ...b, status: BookStatus.ON_SALE }));
        }
        logger.info(`[seed] books inserted: ${books.length}`);
    } else {
        logger.info(`[seed] books already exist (${existing}), skipping`);
    }

    logger.info("[seed] done.");
    await AppDataSource.destroy();
    process.exit(0);
}

main().catch((err) => {
    logger.error(`[seed] failed: ${err}`);
    process.exit(1);
});
