import { Request, Response } from "express";
import { OrderService } from "./order.service";
import { Transaction } from "../payment/transaction.model";

// Create Order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.user_id;
    const { products, delivery_info } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "No products in order" });
    }

    const orderResult = await OrderService.createOrder(userId!, products, delivery_info);

    return res.status(201).json({
      message: "Order created and payment initialized",
      order: orderResult.order,
      payment_required: orderResult.payment_required,
      next: orderResult.next,
    });
  } catch (error: any) {
    console.error("createOrder error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Rebuy Order
export const rebuyOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.user_id;
    const { id } = req.params;

    const result = await OrderService.rebuyOrder(userId!, Number(id));
    if (!result) return res.status(404).json({ message: "Original order not found or invalid" });

    return res.status(201).json({
      message: "Order rebought",
      order: result.order,
      payment_required: result.payment_required,
      payment_link: result.payment_link,
      transaction_id: result.transaction_id,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all Orders
export const getOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.user_id;
    const orders = await OrderService.getOrders(userId!);

    return res.status(200).json({ orders });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Get single Order
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.user_id;
    const { id } = req.params;

    const order = await OrderService.getOrderById(userId!, Number(id));
    if (!order) return res.status(404).json({ message: "Order not found" });

    return res.status(200).json({ order });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
