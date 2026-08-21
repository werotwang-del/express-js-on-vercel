import { Router } from "express";
import * as controller from "./addresses.controller";
import { authRequired } from "@/middlewares/auth";

const router = Router();
router.use(authRequired);

router.get("/", controller.list);
router.post("/", controller.create);
router.patch("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;
