// src/modules/orders/order.service.ts
import { Order, OrderItem } from './order.model';
import { Product } from '../products/product.model';
import { ProductItem } from '../product_items/product_item.model';
import sequelize from '../../config/db';

export class OrderService {
  static getOrderById: any;
  // ✅ Create Order
  static async createOrder(userId: number, products: any[], delivery_info: any) {
    if (!products || products.length === 0) throw new Error('No products in order');

    const t = await sequelize.transaction();
    try {
      let totalAmount = 0;
      const validatedProducts: any[] = [];

      for (const item of products) {
        const product = await Product.findOne({
          where: { product_id: item.product_id, is_active: true },
        });
        if (!product) throw new Error(`Product ID ${item.product_id} is invalid or inactive`);

        let variant: ProductItem | null = null;
        if (item.product_item_id) {
          variant = await ProductItem.findByPk(item.product_item_id);
          if (!variant) throw new Error(`Product variant ID ${item.product_item_id} not found`);
          if (!variant.is_available || (variant.quantity !== null && variant.quantity < item.quantity)) {
            throw new Error(`Not enough stock for variant ID ${item.product_item_id}`);
          }
        }

        const unitPrice = variant ? Number(variant.price) : Number((product as any).price ?? 0);
        totalAmount += unitPrice * item.quantity;

        validatedProducts.push({
          product_id: product.product_id,
          product_item_id: item.product_item_id ?? null,
          quantity: item.quantity,
          price: unitPrice,
        });
      }

      // Create the order
      const order = await Order.create(
        {
          user_id: userId,
          total_amount: totalAmount,
          product_info: JSON.stringify(validatedProducts),
          delivery_details: JSON.stringify(delivery_info),
          delivery_status: 'pending',
          is_canceled: false,
        },
        { transaction: t }
      );

      // Create order items
      for (const vp of validatedProducts) {
        await OrderItem.create(
          {
            order_id: order.order_id,
            product_id: vp.product_id,
            product_item_id: vp.product_item_id,
            quantity: vp.quantity,
            price: vp.price,
          },
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

  // ✅ Rebuy Order
  static async rebuyOrder(userId: number, orderId: number) {
    const order = await Order.findByPk(orderId);
    if (!order) return null;

    const previousProducts = JSON.parse(order.product_info || '[]');
    if (!Array.isArray(previousProducts) || previousProducts.length === 0) return null;

    return await this.createOrder(userId, previousProducts, JSON.parse(order.delivery_details));
  }
}
