// src/modules/orders/order.service.ts
import { ProductItem } from "../product_items/product_item.model";
import { Product } from "../products/product.model";
import { Order, OrderItem } from "./order.model";

export class OrderService {

  static async createOrder(user_id: number, data: any) {
  const { store_id, total_amount, product_info, delivery_details, card_id } = data;

  // Create the order
  const order = await Order.create({
    user_id,
    store_id: store_id || null,
    total_amount,
    product_info,
    delivery_details,
    delivery_status: "pending",
    is_canceled: false,
    card_id: card_id || null
  });

  // Add order items safely
  if (data.items && Array.isArray(data.items)) {
    for (const item of data.items) {
      // Check that the product exists
      const productExists = await Product.findByPk(item.product_id);
      if (!productExists) {
        throw new Error(`Product with ID ${item.product_id} does not exist`);
      }

      // Optional: check product variant if provided
      if (item.product_item_id) {
        const variantExists = await ProductItem.findByPk(item.product_item_id);
        if (!variantExists) {
          throw new Error(`Product variant with ID ${item.product_item_id} does not exist`);
        }
      }

      // Create order item
      await OrderItem.create({
        order_id: order.order_id,
        product_id: item.product_id,
        product_item_id: item.product_item_id || null,
        quantity: item.quantity,
        price: item.price
      });
    }
  }

  return order;
}


  static async getOrderById(order_id: number) {
    const order = await Order.findByPk(order_id, {
      include: [{ model: OrderItem, as: "items" }]
    });
    if (!order) throw new Error("Order not found");
    return order;
  }

  static async listUserOrders(user_id: number) {
    return Order.findAll({
      where: { user_id },
      include: [{ model: OrderItem, as: "items" }]
    });
  }

  static async cancelOrder(user_id: number, order_id: number) {
    const order = await Order.findOne({ where: { order_id, user_id } });
    if (!order) throw new Error("Order not found");
    if (order.delivery_status !== "pending") throw new Error("Cannot cancel shipped/delivered orders");
    order.is_canceled = true;
    order.delivery_status = "cancelled";
    await order.save();
    return { message: "Order canceled successfully" };
  }

  static async rebuyOrder(user_id: number, order_id: number) {
    const oldOrder = await Order.findOne({ where: { order_id, user_id } });
    if (!oldOrder) throw new Error("Original order not found");

    const newOrder = await this.createOrder(user_id, {
      store_id: oldOrder.store_id,
      total_amount: oldOrder.total_amount,
      product_info: oldOrder.product_info,
      delivery_details: oldOrder.delivery_details,
      items: await OrderItem.findAll({ where: { order_id } })
    });

    return newOrder;
  }
}
