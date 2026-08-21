import { Router } from "express";
import * as controller from "./users.controller.js";
import { authRequired } from "../../middlewares/auth.js";

const router = Router();

router.get("/me", authRequired, controller.me);
router.patch("/me", authRequired, controller.updateMe);

export default router;
