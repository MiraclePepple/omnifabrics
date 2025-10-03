// src/modules/orders/order.controller.ts
import { Request, Response } from "express";
import { OrderService } from "./order.service";
import { Order } from "./order.model";
import { PaymentService } from "../payment/payment.service";

export class OrderController {

  static async createOrder(req: Request, res: Response) {
    try {
      if (!req.user) throw new Error("User not authenticated");

      const { store_id, total_amount, product_info, delivery_details } = req.body;

      if (!total_amount || !product_info || !delivery_details) {
        throw new Error("Missing required fields");
      }

      // create the order
      const order = await Order.create({
        user_id: req.user.user_id,
        store_id: store_id || null,
        total_amount,
        product_info,
        delivery_details,
        delivery_status: "pending",
        is_canceled: false,
        card_id: null
      });

      // Initiate payment
      const paymentResult = await PaymentService.payForOrder(req.user.user_id, order.order_id);

      // Respond with order + payment URL
      return res.status(201).json({
        message: "Payment initiated",
        order,
        payment_url: paymentResult.payment_link
      });

    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getOrderById(req: Request, res: Response) {
    try {
      const order_id = Number(req.params.id);
      const order = await OrderService.getOrderById(order_id);
      return res.json({ order });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async listUserOrders(req: Request, res: Response) {
    try {
      const user_id = req.user!.user_id;
      const orders = await OrderService.listUserOrders(user_id);
      return res.json({ orders });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async cancelOrder(req: Request, res: Response) {
    try {
      const user_id = req.user!.user_id;
      const order_id = Number(req.params.id);
      const result = await OrderService.cancelOrder(user_id, order_id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async rebuyOrder(req: Request, res: Response) {
    try {
      const user_id = req.user!.user_id;
      const order_id = Number(req.params.id);
      const newOrder = await OrderService.rebuyOrder(user_id, order_id);
      return res.status(201).json({ message: "Order rebought", order: newOrder });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
