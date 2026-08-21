import { Router } from "express";
import * as controller from "./books.controller";
import { validate } from "@/middlewares/validate";
import { authRequired, requireRole } from "@/middlewares/auth";

const router = Router();

router.get("/", validate({ query: controller.listQuerySchema }), controller.list);
router.get("/:id", controller.detail);
router.post("/", authRequired, requireRole("admin"), controller.create);
router.patch("/:id", authRequired, requireRole("admin"), controller.update);
router.delete("/:id", authRequired, requireRole("admin"), controller.remove);

export default router;
