// src/modules/payments/payment.controller.ts
import { Request, Response } from "express";
import { PaymentService } from "./payment.service";

export class PaymentController {

  // Initiate payment for an order
   static async payForOrder(req: Request, res: Response) {
  try {
    if (!req.user) throw new Error("User not authenticated");
    const user_id = req.user.user_id;

    // Correctly get order_id from URL param
    const { order_id } = req.params;
    if (!order_id) throw new Error("Order ID is required");

    const result = await PaymentService.payForOrder(user_id, parseInt(order_id));
    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}


  // Squadco webhook endpoint
  static async webhook(req: Request, res: Response) {
    console.log("Webhook body:", req.body);
    try {
      const data = req.body;
      const payment = await PaymentService.handleWebhook(data);
      return res.status(200).json({ message: "Webhook processed", payment });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Get all payments of the user
  static async getUserPayments(req: Request, res: Response) {
    try {
      const user_id = req.user!.user_id;
      const payments = await PaymentService.getUserPayments(user_id);
      return res.json({ payments });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
