// src/modules/orders/order.routes.ts
import { Router } from "express";
import { OrderController } from "./order.controller";
import { PaymentController } from "../payment/payment.controller";
import { authenticate } from "../../middlewares/validate.middleware";

const router = Router();

// Create an order
router.post("/", authenticate, OrderController.createOrder);

// Get a single order
router.get("/:id", authenticate, OrderController.getOrderById);

// List all user orders
router.get("/", authenticate, OrderController.listUserOrders);

// Cancel an order
router.patch("/:id/cancel", authenticate, OrderController.cancelOrder);

// Rebuy an order (create new order from previous)
router.post("/:id/rebuy", authenticate, OrderController.rebuyOrder);

// Payment for an order
router.post("/:order_id/pay", authenticate, PaymentController.payForOrder);

// Squadco webhook for payment
router.post("/webhook", PaymentController.webhook);

export default router;
