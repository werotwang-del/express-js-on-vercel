import { Router } from "express";
import * as controller from "./cart.controller";
import { authRequired } from "@/middlewares/auth";

const router = Router();

router.use(authRequired);

router.get("/", controller.list);
router.post("/", controller.add);
router.patch("/:id", controller.update);
router.patch("/:id/select", controller.select);
router.delete("/:id", controller.remove);

export default router;
