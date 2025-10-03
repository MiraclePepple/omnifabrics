import { Wishlist } from './wishlist.model';
import { CartService } from '../cart/cart.service';
import { Product } from '../products/product.model';
import { ProductItem } from '../product_items/product_item.model';
import { Op } from 'sequelize';

export class WishlistService {
  static async addToWishlist(user_id: number, product_id: number, product_item_id?: number | null) {
    // Check product exists
    const product = await Product.findByPk(product_id);
    if (!product) throw new Error('Product not found');
    // Optionally check variant exists
    if (product_item_id) {
      const variant = await ProductItem.findByPk(product_item_id);
      if (!variant) throw new Error('Product variant not found');
    }
    // Prevent duplicate wishlist entry
    const existing = await Wishlist.findOne({ where: { user_id, product_id, product_item_id } });
    if (existing) throw new Error('Product already in wishlist');

    const wish = await Wishlist.create({ user_id, product_id, product_item_id, created_at: new Date(), updated_at: new Date() });
    return wish;
  }

  static async removeFromWishlist(user_id: number, wish_id: number) {
    const wish = await Wishlist.findOne({ where: { wish_id, user_id } });
    if (!wish) throw new Error('Wishlist item not found');
    await wish.destroy();
    return { message: 'Removed' };
  }

  static async listWishlist(user_id: number) {
    const items = await Wishlist.findAll({ where: { user_id } });
    const detailed = await Promise.all(items.map(async (it: any) => {
      const product = await Product.findByPk(it.product_id);
      const variant = it.product_item_id ? await ProductItem.findByPk(it.product_item_id) : null;

      const available = !!product && product.is_active &&
                        (!variant || (variant.is_available && (variant.quantity === null || variant.quantity > 0)));

      return {
        wish_id: it.wish_id,
        product_id: it.product_id,
        product_name: product?.product_name ?? null,
        product_images: product?.images ?? null,
        variant: variant ? {
          product_item_id: variant.product_item_id,
          color: variant.color,
          price: variant.price,
          is_available: variant.is_available,
          quantity_available: variant.quantity
        } : null,
        available
      };
    }));
    return detailed;
  }

  static async moveToCart(user_id: number, wish_id: number, quantity = 1) {
  const wish = await Wishlist.findOne({ where: { wish_id, user_id } });
  if (!wish) throw new Error("Wishlist item not found");

  // Add to cart
  const cartItem = await CartService.addItemToCart(user_id, {
    product_id: wish.product_id,
    product_item_id: wish.product_item_id,
    quantity
  });

  // Optionally: remove item from wishlist after moving
  await wish.destroy();

  return { message: "Item moved to cart successfully", cartItem };
  }
}
