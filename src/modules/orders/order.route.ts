// src/modules/orders/order.route.ts
import { Router } from "express";
import { createOrder, getOrders, getOrderById } from "./order.controller";
import { authenticate } from "../../middlewares/validate.middleware";

const router = Router();

router.post("/create-order", authenticate, createOrder);
router.get("/get-order", authenticate, getOrders);
router.get("/get-order/:id", authenticate, getOrderById);
//router.post("/rebuy/:id", authenticate, rebuyOrder);

export default router;
