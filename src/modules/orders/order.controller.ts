import { Request, Response } from "express";
import { Order } from "../models/orderModel";
import { ProductItem } from "../models/productItemModel";
import { Cart } from "../models/cartModel";
import { CartItem } from "../models/cartItemModel";


 //Get all previous orders for a user

export const getOrderHistory = async (req: Request, res: Response) => {
  const { user_id } = req.params;

  try {
    const orders = await Order.findAll({
      where: { user_id },
      order: [["created_at", "DESC"]],
    });

    if (!orders || orders.length === 0) {
      return res.json({ message: "No previous orders found", orders: [] });
    }

    // Parse product info for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const products = JSON.parse(order.product_info);

        // For each product, check current availability
        const productsWithStatus = await Promise.all(
          products.map(async (p: any) => {
            const productItem = await ProductItem.findByPk(p.product_item_id);
            return {
              ...p,
              is_available: productItem ? productItem.is_available && productItem.quantity > 0 : false,
            };
          })
        );

        return {
          order_id: order.order_id,
          total_amount: order.total_amount,
          delivery_details: JSON.parse(order.delivery_details),
          delivery_status: order.delivery_status,
          created_at: order.created_at,
          products: productsWithStatus,
        };
      })
    );

    return res.json({ orders: ordersWithDetails });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

//Re-buy a product from a previous order
 
export const rebuyProduct = async (req: Request, res: Response) => {
  const { user_id } = req.body;
  const { product_item_id, quantity = 1 } = req.body;

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

    // Check if product is already in cart
    const existingItem = await CartItem.findOne({ where: { cart_id: cart.cart_id, product_item_id } });
    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
    } else {
      await CartItem.create({ cart_id: cart.cart_id, product_item_id, quantity });
    }

    return res.json({ message: "Product added to cart for re-buy", cart_id: cart.cart_id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
