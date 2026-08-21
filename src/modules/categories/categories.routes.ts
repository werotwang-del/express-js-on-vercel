import { Router } from "express";
import * as controller from "./categories.controller.js";
import { authRequired, requireRole } from "../../middlewares/auth.js";

const router = Router();

router.get("/", controller.list);
router.get("/:id", controller.detail);
router.post("/", authRequired, requireRole("admin"), controller.create);
router.patch("/:id", authRequired, requireRole("admin"), controller.update);
router.delete("/:id", authRequired, requireRole("admin"), controller.remove);

export default router;
