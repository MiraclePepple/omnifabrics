import { Order, OrderItem } from "./order.model";
import { Product } from "../products/product.model";
import { ProductItem } from "../product_items/product_item.model";
import NotificationService from "../notifications/notification.service";
import sequelize from "../../config/db";
import { PaymentService } from "../payment/payment.service";

interface OrderResult {
  order: Order;
  payment_required: boolean;
  next?: string;
  payment_link?: string;
  transaction_id?: number;
}

export class OrderService {

  // Create Order
  static async createOrder(userId: number, products: any[], delivery_info: any): Promise<OrderResult> {
    if (!products || products.length === 0) throw new Error('No products in order');

    const t = await sequelize.transaction();
    try {
      let totalAmount = 0;
      const validatedProducts: any[] = [];

      for (const item of products) {
        const product = await Product.findByPk(item.product_id);
        if (!product || !product.is_active) throw new Error(`Product ID ${item.product_id} invalid or inactive`);

        let variant: ProductItem | null = null;
        if (item.product_item_id) {
          variant = await ProductItem.findByPk(item.product_item_id);
          if (!variant) throw new Error(`Product variant ID ${item.product_item_id} not found`);
          if (!variant.is_available || (variant.quantity !== null && variant.quantity < item.quantity)) {
            throw new Error(`Not enough stock for variant ID ${item.product_item_id}`);
          }
        }

        const unitPrice = variant ? Number(variant.price) : 0;
        totalAmount += unitPrice * item.quantity;

        validatedProducts.push({
          product_id: product.product_id,
          product_item_id: item.product_item_id ?? null,
          quantity: item.quantity,
          price: unitPrice,
        });
      }

      const order = await Order.create(
        {
          user_id: userId,
          total_amount: totalAmount,
          product_info: JSON.stringify(validatedProducts),
          delivery_details: JSON.stringify(delivery_info),
          delivery_status: 'pending',
          payment_status: 'pending',
          is_canceled: false,
        },
        { transaction: t }
      );

      for (const vp of validatedProducts) {
        await OrderItem.create(
          { order_id: order.order_id, product_id: vp.product_id, product_item_id: vp.product_item_id, quantity: vp.quantity, price: vp.price },
          { transaction: t }
        );
      }

      await t.commit();

      return {
        order,
        payment_required: true,
        next: `/api/payments/pay?order_id=${order.order_id}`,
      };
    } catch (err) {
      await t.rollback();
      throw err;
    }
    
  }

  // Rebuy previous order
  static async rebuyOrder(userId: number, previousOrderId: number): Promise<OrderResult | null> {
    const prevOrder = await Order.findByPk(previousOrderId);
    if (!prevOrder) return null;

    const previousProducts = JSON.parse(prevOrder.product_info || '[]');
    const deliveryDetails = JSON.parse(prevOrder.delivery_details || '{}');

    if (!Array.isArray(previousProducts) || previousProducts.length === 0) return null;

    // Create new order with the same products and delivery info
    const newOrderResult = await this.createOrder(userId, previousProducts, deliveryDetails);

    // Prepare meta for payment
    const meta = {
      email: 'customer@example.com', // Replace with actual user email if available
      name: 'Customer',              // Replace with user full name if available
    };

    // Trigger payment
    const { transaction, payment_link } = await PaymentService.initializePayment(
      userId,
      newOrderResult.order,
      newOrderResult.order.total_amount,
      'NGN',
      meta
    );

    newOrderResult.payment_link = payment_link;
    newOrderResult.transaction_id = transaction.transaction_id;

    return newOrderResult;
  }

  // Get all orders for user
  static async getOrders(userId: number) {
    return await Order.findAll({
      where: { user_id: userId },
      include: [{ model: OrderItem, as: "items", include: [{ model: Product, as: "product" }] }],
      order: [["created_at", "DESC"]],
    });
  }

  // Get single order by ID
  static async getOrderById(userId: number, orderId: number) {
    return await Order.findOne({
      where: { user_id: userId, order_id: orderId },
      include: [{ model: OrderItem, as: "items", include: [{ model: Product, as: "product" }] }],
    });
  }
}
