import { Router } from "express";
import * as controller from "./orders.controller";
import { authRequired, requireRole } from "@/middlewares/auth";
import { z } from "zod";
import { OrderStatus } from "./order.entity";
import { ordersService } from "./orders.service";

const router = Router();
router.use(authRequired);

// user routes
router.post("/", controller.create);
router.get("/", controller.list);
router.get("/:id", controller.detail);
router.post("/:id/pay", controller.pay);
router.post("/:id/cancel", controller.cancel);

// admin: update order status
const adminStatusSchema = z.object({ status: z.nativeEnum(OrderStatus) });
router.patch(
  "/:id/status",
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const { status } = adminStatusSchema.parse(req.body);
      const data = await ordersService.updateStatus(req.params.id, status);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
);

export default router;
