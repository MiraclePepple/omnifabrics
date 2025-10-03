import { Order, OrderItem } from '../orders/order.model';
import { PaymentService } from '../payment/payment.service';
import { ProductItem } from '../product_items/product_item.model';
import { Cart, CartItem } from './cart.model';

export class CartService {
  static async addItem(
    user_id: number,
    data: { product_id: number; product_item_id: number; quantity: number }
  ) {
    let cart = await Cart.findOne({ where: { user_id } });
    if (!cart) cart = await Cart.create({ user_id });

    let item = await CartItem.findOne({
      where: {
        cart_id: cart.cart_id,
        product_id: data.product_id,
        product_item_id: data.product_item_id,
      },
    });

    if (item) {
      item.quantity += data.quantity;
      await item.save();
    } else {
      item = await CartItem.create({
        cart_id: cart.cart_id,
        product_id: data.product_id,
        product_item_id: data.product_item_id,
        quantity: data.quantity,
      });
    }

    return item;
  }

  static async updateItem(user_id: number, cart_item_id: number, quantity: number) {
    const cart = await Cart.findOne({ where: { user_id } });
    if (!cart) throw new Error('Cart not found');

    const item = await CartItem.findOne({ where: { cart_id: cart.cart_id, cart_item_id } });
    if (!item) throw new Error('Cart item not found');

    item.quantity = quantity;
    await item.save();
    return item;
  }

  static async removeItem(user_id: number, cart_item_id: number) {
    const cart = await Cart.findOne({ where: { user_id } });
    if (!cart) throw new Error('Cart not found');

    const item = await CartItem.findOne({ where: { cart_id: cart.cart_id, cart_item_id } });
    if (!item) throw new Error('Cart item not found');

    await item.destroy();
    return { message: 'Item removed from cart' };
  }

  static async listItems(user_id: number) {
    const cart = await Cart.findOne({
      where: { user_id },
      include: [{ model: CartItem, as: 'cart_items', include: ['product', 'product_variant'] }],
    });
    if (!cart) return [];
    return cart.cart_items || [];
  }


  static async checkoutCart(userId: number, orderId: number) {
  // ✅ Ensure order exists
  const order = await Order.findOne({ where: { orderId, userId } });
  if (!order) {
    throw new Error("Order not found or does not belong to this user");
  }

  // ✅ Trigger payment
  const payment = await PaymentService.payForOrder(userId, orderId);

  // ✅ Clear cart after checkout
  const cart = await Cart.findOne({ where: { user_id: userId } });
  if (cart) {
    await CartItem.destroy({ where: { cart_id: cart.cart_id } });
  }

  return {
    message: "Checkout initiated successfully",
    order,
    payment,
  };
}

static async addItemToCart(user_id: number, { product_id, product_item_id, quantity }: { product_id: number, product_item_id?: number | null, quantity: number }) {
    // 1. Ensure user has a cart
    let cart = await Cart.findOne({ where: { user_id } });
    if (!cart) {
      cart = await Cart.create({ user_id });
    }

    // 2. Check if product already exists in cart
    const existingItem = await CartItem.findOne({
      where: { cart_id: cart.cart_id, product_id, product_item_id }
    });

    if (existingItem) {
      // Update quantity if it already exists
      existingItem.quantity += quantity;
      await existingItem.save();
      return existingItem;
    }

    // 3. Otherwise, create new cart item
    const newItem = await CartItem.create({
      cart_id: cart.cart_id,
      product_id,
      product_item_id,
      quantity
    });

    return newItem;
  }
}