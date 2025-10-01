import { Router } from "express";
import { createOrder, getOrders, getOrderById, rebuyOrder } from "./order.controller";
import { authenticate } from "../../middlewares/validate.middleware";

const router = Router();

router.post("/order", authenticate, createOrder);           // create order
router.get("/order", authenticate, getOrders);             // get all orders
router.get("/order/:id", authenticate, getOrderById);       // get single order
router.post("/rebuy/:id", authenticate, rebuyOrder);  // rebuy order

export default router;
