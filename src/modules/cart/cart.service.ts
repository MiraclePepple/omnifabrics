import { Cart, CartItem } from './cart.model'; // adjust path if different
import { Product } from '../products/product.model';
import { ProductItem } from '../product_items/product_item.model';
import sequelize from '../../config/db';
import { Op } from 'sequelize';

export class CartService {
  // Ensure a cart exists for the user and return it
  static async ensureCart(user_id: number) {
    let cart = await Cart.findOne({ where: { user_id } });
    if (!cart) {
      cart = await Cart.create({ user_id, created_at: new Date(), updated_at: new Date() });
    }
    return cart;
  }

  // Add item to cart (creates or updates quantity)
  static async addItemToCart(user_id: number, payload: {
    product_id: number;
    product_item_id?: number | null;
    quantity?: number;
  }) {
    const { product_id, product_item_id = null, quantity = 1 } = payload;

    // check product exists and active
    const product = await Product.findByPk(product_id);
    if (!product || !product.is_active) throw new Error('Product not available');

    // check variant/sku if provided
    let itemVariant = null;
    if (product_item_id) {
      itemVariant = await ProductItem.findByPk(product_item_id);
      if (!itemVariant) throw new Error('Product variant not found');
      if (!itemVariant.is_available || (itemVariant.quantity !== null && itemVariant.quantity < quantity)) {
        throw new Error('Requested quantity not available for this variant');
      }
    }

    // ensure cart exists
    const cart = await this.ensureCart(user_id);

    // Check if item already exists in cart (same product + variant)
    const existing = await CartItem.findOne({
      where: {
        cart_id: cart.getDataValue('cart_id'),
        product_id,
        product_item_id
      }
    });

    if (existing) {
      // update quantity
      const newQuantity = existing.getDataValue('quantity') + quantity;
      // Optionally check availability again for newQuantity
      if (itemVariant && itemVariant.quantity !== null && itemVariant.quantity < newQuantity) {
        throw new Error('Not enough stock to increase quantity');
      }
      await existing.update({ quantity: newQuantity, updated_at: new Date() });
      return existing;
    } else {
      // create new cart item
      const newItem = await CartItem.create({
        cart_id: cart.getDataValue('cart_id'),
        product_id,
        product_item_id,
        quantity
      });
      return newItem;
    }
  }

  // List items in cart with availability status and product details
  static async listCartItems(user_id: number) {
    const cart = await Cart.findOne({ where: { user_id } });
    if (!cart) return [];

    const items = await CartItem.findAll({
      where: { cart_id: cart.getDataValue('cart_id') },
      raw: false
    });

    // Build detailed view
    const detailed = await Promise.all(items.map(async (it: any) => {
      const product = await Product.findByPk(it.product_id);
      const variant = it.product_item_id ? await ProductItem.findByPk(it.product_item_id) : null;

      const available = !!product && product.is_active &&
                        (!variant || (variant.is_available && (variant.quantity === null || variant.quantity >= it.quantity)));

      return {
        cart_item_id: it.getDataValue('cart_item_id'),
        product_id: it.product_id,
        product_name: product?.product_name ?? null,
        product_short_description: product?.short_description ?? null,
        product_images: product?.images ?? null,
        variant: variant ? {
          product_item_id: variant.getDataValue('product_item_id'),
          color: variant.color,
          price: variant.price,
          quantity_available: variant.quantity,
          is_available: variant.is_available
        } : null,
        requested_quantity: it.quantity,
        available,
      };
    }));

    return detailed;
  }

  // Remove cart item by id (ensure belongs to user's cart)
  static async removeCartItem(user_id: number, cart_item_id: number) {
    const cart = await Cart.findOne({ where: { user_id } });
    if (!cart) throw new Error('Cart not found');

    const item = await CartItem.findOne({ where: { cart_item_id, cart_id: cart.getDataValue('cart_id') } });
    if (!item) throw new Error('Cart item not found');

    await item.destroy();
    return { message: 'removed' };
  }

  // Prepare checkout: verify availability for all items and return total + payment payload
  // NOTE: do not decrement stock here — decrement only after successful payment (webhook)
  static async prepareCheckout(user_id: number, delivery_info?: any, card_info?: any) {
    const cart = await Cart.findOne({ where: { user_id } });
    if (!cart) throw new Error('Cart is empty');

    const items = await CartItem.findAll({ where: { cart_id: cart.getDataValue('cart_id') } });
    if (!items.length) throw new Error('Cart is empty');


let total = 0;
const breakdown: any[] = [];

for (const it of items) {
  // always convert instance to plain object
  const cartItem = it.toJSON();

  const product = await Product.findByPk(cartItem.product_id);
  if (!product || !product.is_active) {
    breakdown.push({
      cart_item_id: cartItem.cart_item_id,
      available: false,
      reason: 'Product unavailable'
    });
    continue;
  }

  let unitPrice = 0;
  let available = true;

  if (cartItem.product_item_id) {
    const variant = await ProductItem.findByPk(cartItem.product_item_id);
    if (!variant || !variant.is_available) {
      available = false;
    } else {
      // safely get quantity
      const variantQty = variant.getDataValue('quantity');
      if (variantQty !== null && variantQty < cartItem.quantity) {
        available = false;
      }
      unitPrice = Number(variant.getDataValue('price') ?? 0);
    }
  } else {
    // fallback price from product if you actually have one
    unitPrice = Number((product as any).price ?? 0); 
  }

  if (!available) {
    breakdown.push({
      cart_item_id: cartItem.cart_item_id,
      available: false,
      reason: 'Insufficient stock'
    });
    continue;
  }

  const subtotal = unitPrice * cartItem.quantity;
  total += subtotal;
  breakdown.push({
    cart_item_id: cartItem.cart_item_id,
    product_id: cartItem.product_id,
    unitPrice,
    quantity: cartItem.quantity,
    subtotal,
    available: true
  });
}


    // If any item unavailable, report back with details
    const unavailable = breakdown.filter(d => !d.available);
    if (unavailable.length) {
      return { ok: false, message: 'Some items are unavailable', breakdown };
    }

    // Build payment payload (to be sent to payment provider)
    const paymentPayload = {
      amount: total.toFixed(2),
      currency: 'NGN', // adapt as needed
      items: breakdown,
      delivery_info: delivery_info ?? null,
      card_info_present: !!card_info
    };

    return { ok: true, total, paymentPayload };
  }
}
