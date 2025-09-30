import { Request, Response } from 'express';
import { CartService } from './cart.service';

export class CartController {
  static async addToCart(req: Request, res: Response) {
    try {
      const user_id = (req as any).user.user_id;
      const { product_id, product_item_id, quantity } = req.body;
      const item = await CartService.addItemToCart(user_id, { product_id, product_item_id, quantity });
      return res.status(201).json(item);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getCart(req: Request, res: Response) {
    try {
      const user_id = (req as any).user.user_id;
      const items = await CartService.listCartItems(user_id);
      return res.json(items);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async removeItem(req: Request, res: Response) {
    try {
      const user_id = (req as any).user.user_id;
      const cart_item_id = Number(req.params.cartItemId);
      const result = await CartService.removeCartItem(user_id, cart_item_id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Prepare checkout and return payment-info (do not process payment here)
  static async checkout(req: Request, res: Response) {
    try {
      const user_id = (req as any).user.user_id;
      const { delivery_info, card_info } = req.body;
      const result = await CartService.prepareCheckout(user_id, delivery_info, card_info);
      if (!result.ok) return res.status(400).json(result);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
