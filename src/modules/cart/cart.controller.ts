import { Request, Response } from 'express';
import * as service from './cart.service';


export const addToCart = async (req:Request, res:Response) => {
  try {
    const userId = req.user.user_id;
    const item = await service.addItemToCart(userId, req.body);
    res.status(201).json(item);
  } catch (err:any) {
    res.status(400).json({ error: err.message });
  }
};

export const getCart = async (req:Request, res:Response) => {
  const items = await service.listCartItems(req.user.user_id);
  res.json(items);
};

export const removeItem = async (req:Request, res:Response) => {
  await service.removeCartItem(Number(req.params.cartItemId));
  res.json({ message: 'removed' });
};
