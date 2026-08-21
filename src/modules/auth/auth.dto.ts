import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().email("Invalid email").max(120),
    username: z
        .string()
        .min(3, "Username must be at least 3 chars")
        .max(40, "Username max 40 chars")
        .regex(/^[a-zA-Z0-9_-]+$/, "Username only letters, numbers, _ or -"),
    password: z.string().min(8, "Password min 8 chars").max(64),
    phone: z
        .string()
        .regex(/^\+?\d{6,20}$/, "Invalid phone")
        .optional(),
});
export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
export type LoginDto = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
    refreshToken: z.string().min(10),
});
export type RefreshDto = z.infer<typeof refreshSchema>;
