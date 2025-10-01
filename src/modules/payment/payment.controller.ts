// src/modules/payment/payment.controller.ts
import { Request, Response } from "express";
import { PaymentService } from "./payment.service";
import { OrderService } from "../orders/order.service";

export class PaymentController {

  // Trigger payment
  static async payForOrder(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const { order_id } = req.body;
      if (!order_id) return res.status(400).json({ error: "Missing order_id" });

      const order = await OrderService.getOrderById(user.user_id, Number(order_id));
      if (!order) return res.status(404).json({ error: "Order not found" });

      const products: any[] = JSON.parse(order.product_info || "[]");
      const amount = products.reduce((sum, p) => sum + Number(p.price) * Number(p.quantity), 0);

      const meta = {
        email: user.email,
        phone_number: user.phone_number,
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      };

      const { transaction, payment_link } = await PaymentService.initializePayment(
        user.user_id,
        order,
        amount,
        "NGN",
        meta
      );

      return res.status(200).json({
        message: "Payment initialized",
        payment_link,
        transaction_id: transaction.transaction_id,
      });
    } catch (err: any) {
      console.error("payForOrder error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // Squadco webhook
  static async webhook(req: Request, res: Response) {
    try {
      const payload = req.body;
      await PaymentService.finalizePayment(payload);
      return res.status(200).json({ status: "ok" });
    } catch (err: any) {
      console.error("Webhook error:", err);
      return res.status(500).json({ error: err.message });
    }
  }
}
