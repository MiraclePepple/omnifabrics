import { Request, Response } from "express";
import { Cart } from "../models/cartModel";
import { CartItem } from "../models/cartItemModel";
import { ProductItem } from "../models/productItemModel";

// Add product to cart
export const addToCart = async (req: Request, res: Response) => {
  const { user_id, product_item_id, quantity = 1 } = req.body;

  try {
    const productItem = await ProductItem.findByPk(product_item_id);
    if (!productItem || !productItem.is_available || productItem.quantity < quantity) {
      return res.status(400).json({ message: "Product is out of stock" });
    }

    // Find or create cart
    let cart = await Cart.findOne({ where: { user_id } });
    if (!cart) {
      cart = await Cart.create({ user_id });
    }

    // Check if item already exists in cart
    const existingItem = await CartItem.findOne({ where: { cart_id: cart.cart_id, product_item_id } });
    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
    } else {
      await CartItem.create({ cart_id: cart.cart_id, product_item_id, quantity });
    }

    return res.json({ message: "Product added to cart", cart_id: cart.cart_id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Remove product from cart
export const removeFromCart = async (req: Request, res: Response) => {
  const { cart_item_id } = req.params;

  try {
    const item = await CartItem.findByPk(cart_item_id);
    if (!item) return res.status(404).json({ message: "Cart item not found" });

    await item.destroy();
    return res.json({ message: "Item removed from cart" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// View cart with availability status
export const viewCart = async (req: Request, res: Response) => {
  const { user_id } = req.params;

  try {
    const cart = await Cart.findOne({ where: { user_id } });
    if (!cart) return res.json({ cart: [], message: "Cart is empty" });

    const items = await CartItem.findAll({ where: { cart_id: cart.cart_id } });

    const cartWithAvailability = await Promise.all(
      items.map(async (item) => {
        const productItem = await ProductItem.findByPk(item.product_item_id);
        const available = productItem ? productItem.is_available && productItem.quantity > 0 : false;
        return { ...item.toJSON(), available };
      })
    );

    return res.json({ cart: cartWithAvailability });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
