import { Request, Response } from "express";
import { OrderService } from "./order.service";

//Create Order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.user_id;
    const { products, delivery_info } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "No products in order" });
    }

    const result = await OrderService.createOrder(userId!, products, delivery_info);

    // result now contains { order, payment_required, next }
    return res.status(201).json({
      message: "Order created",
      order: result.order,
      payment_required: result.payment_required,
      next: result.next,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Get Orders
export const getOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.user_id;
    const orders = await OrderService.getOrders(userId!);
    return res.status(200).json({ orders });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Get Order By Id
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.user_id;
    const { id } = req.params;

    const orderId = Number(id);
    if (isNaN(orderId)) return res.status(400).json({ message: "Invalid order ID" });

    const order = await OrderService.getOrderById(userId!, orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    return res.status(200).json({ order });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
