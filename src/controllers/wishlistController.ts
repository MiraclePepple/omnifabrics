import { Request, Response } from "express";
import { Wishlist } from "../models/wishlistModel";
import { Cart } from "../models/cartModel";
import { CartItem } from "../models/cartItemModel";
import { Product } from "../models/productModel";

// Add item to wishlist
export const addToWishlist = async (req: Request, res: Response) => {
  const { user_id, product_id, product_item_id } = req.body;

  try {
    const exists = await Wishlist.findOne({ where: { user_id, product_id, product_item_id } });
    if (exists) return res.status(400).json({ message: "Item already in wishlist" });

    const wish = await Wishlist.create({ user_id, product_id, product_item_id });
    return res.json({ message: "Item added to wishlist", wish });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (req: Request, res: Response) => {
  const { wish_id } = req.params;

  try {
    const wish = await Wishlist.findByPk(wish_id);
    if (!wish) return res.status(404).json({ message: "Wishlist item not found" });

    await wish.destroy();
    return res.json({ message: "Item removed from wishlist" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// View wishlist with availability
export const viewWishlist = async (req: Request, res: Response) => {
  const { user_id } = req.params;

  try {
    const wishlist = await Wishlist.findAll({ where: { user_id } });

    const wishlistWithStatus = await Promise.all(
      wishlist.map(async (item) => {
        const product = await Product.findByPk(item.product_id);
        const available = product ? product.is_active : false;
        return { ...item.toJSON(), available };
      })
    );

    return res.json({ wishlist: wishlistWithStatus });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Move wishlist item to cart
export const moveToCart = async (req: Request, res: Response) => {
  const { wish_id, user_id, quantity = 1 } = req.body;

  try {
    const wish = await Wishlist.findByPk(wish_id);
    if (!wish) return res.status(404).json({ message: "Wishlist item not found" });

    // Find or create cart for the user
    let cart = await Cart.findOne({ where: { user_id } });
    if (!cart) {
      cart = await Cart.create({ user_id });
    }

    // Add to cart items
    await CartItem.create({
      cart_id: cart.cart_id,
      product_item_id: wish.product_item_id || wish.product_id,
      quantity,
    });

    // Remove from wishlist
    await wish.destroy();

    return res.json({ message: "Item moved to cart", cart_id: cart.cart_id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
