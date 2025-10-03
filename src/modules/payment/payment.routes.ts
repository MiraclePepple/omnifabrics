// src/modules/payments/payment.routes.ts
import { Router } from "express";
import { PaymentController } from "./payment.controller";
import { authenticate } from "../../middlewares/validate.middleware"; // user auth middleware

const router = Router();

// Initiate payment for an order (authenticated user)
router.post("/:order_id/pay", authenticate, PaymentController.payForOrder);

// Squadco webhook endpoint
router.post("/payment/webhook", PaymentController.webhook);

// Get all payments of the authenticated user
router.get("/payments", authenticate, PaymentController.getUserPayments);

export default router;
