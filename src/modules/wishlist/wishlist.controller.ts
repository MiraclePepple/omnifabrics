import { Request, Response } from 'express';
import * as service from './wishlist.service';

export const add = async (req:Request, res:Response) => {
  const userId = req.user.user_id;
  const w = await service.addToWishlist(userId, req.body);
  res.status(201).json(w);
};

export const list = async (req:Request, res:Response) => {
  const items = await service.listWishlist(req.user.user_id);
  res.json(items);
};

export const remove = async (req:Request, res:Response) => {
  await service.removeFromWishlist(Number(req.params.wishId), req.user.user_id);
  res.json({ message: 'removed' });
};
