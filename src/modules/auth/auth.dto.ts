import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().email("邮箱格式不正确").max(120),
    username: z
        .string()
        .min(3, "用户名长度不能小于 3")
        .max(40, "用户名长度不能大于 40")
        .regex(/^[a-zA-Z0-9_-]+$/, "用户名只能包含字母、数字、_ 或 -"),
    password: z.string().min(8, "密码长度不能小于 8").max(64),
    phone: z
        .string()
        .regex(/^\+?\d{6,20}$/, "手机号格式不正确")
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
