import { Request, Response } from 'express';
import { WishlistService } from './wishlist.service';

export class WishlistController {
  static async add(req: Request, res: Response) {
    try {
      const user_id = (req as any).user.user_id;
      const { product_id, product_item_id } = req.body;
      const wish = await WishlistService.addToWishlist(user_id, product_id, product_item_id);
      return res.status(201).json(wish);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async remove(req: Request, res: Response) {
    try {
      const user_id = (req as any).user.user_id;
      const wish_id = Number(req.params.wishId);
      const result = await WishlistService.removeFromWishlist(user_id, wish_id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const user_id = (req as any).user.user_id;
      const items = await WishlistService.listWishlist(user_id);
      return res.json(items);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async moveToCart(req: Request, res: Response) {
  try {
    console.log("PARAMS:", req.params);   // 👈 check this
    console.log("BODY:", req.body);

    const user_id = (req as any).user.user_id;
    const wish_id = Number(req.params.wishId); // could be NaN if route wrong
    const { quantity } = req.body;

    const result = await WishlistService.moveToCart(user_id, wish_id, quantity ?? 1);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

}
