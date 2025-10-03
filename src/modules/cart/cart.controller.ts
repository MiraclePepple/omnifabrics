// src/modules/cart/cart.controller.ts
import { Request, Response } from 'express';
import { CartService } from './cart.service';

export class CartController {
  static async addItem(req: Request, res: Response) {
    try {
      if (!req.user) throw new Error('User not authenticated');

      const { product_id, product_item_id, quantity } = req.body;
      if (!product_id || !product_item_id || !quantity) {
        throw new Error('Missing required fields');
      }

      const item = await CartService.addItem(req.user.user_id, { product_id, product_item_id, quantity });
      return res.status(201).json({ message: 'Item added to cart', item });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async updateItem(req: Request, res: Response) {
    try {
      const cart_item_id = parseInt(req.params.id);
      const { quantity } = req.body;
      const item = await CartService.updateItem(req.user!.user_id, cart_item_id, quantity);
      return res.json({ message: 'Item updated', item });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async removeItem(req: Request, res: Response) {
    try {
      const cart_item_id = parseInt(req.params.cartItemId);
      const result = await CartService.removeItem(req.user!.user_id, cart_item_id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async listCartItems(req: Request, res: Response) {
    try {
      const items = await CartService.listItems(req.user!.user_id);
      return res.json({ items });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async checkout(req: Request, res: Response) {
    try {
      if (!req.user) throw new Error("User not authenticated");

      const { orderId } = req.body;
      if (!orderId) throw new Error("Order ID is required");

      const result = await CartService.checkoutCart(req.user.user_id, orderId);

      return res.status(201).json(result);
    } catch (err: any) {
    console.error("Checkout error:", err.message);
    return res.status(400).json({ error: err.message });
  }
}

}


