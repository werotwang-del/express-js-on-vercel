import { Router } from "express";
import * as controller from "./auth.controller";
import { validate } from "@/middlewares/validate";
import { authRequired } from "@/middlewares/auth";
import { authLimiter } from "@/middlewares/rateLimiter";
import { loginSchema, refreshSchema, registerSchema } from "./auth.dto";

const router = Router();

router.post("/register", authLimiter, validate({ body: registerSchema }), controller.register);
router.post("/login", authLimiter, validate({ body: loginSchema }), controller.login);
router.post("/refresh", authLimiter, validate({ body: refreshSchema }), controller.refresh);
router.post("/logout", authRequired, controller.logout);
router.get("/me", authRequired, controller.me);

export default router;
