import { Request, Response } from 'express';
//import { auth } from '../auth/auth.middleware'; 
import * as service from './cart.service';

export const addToCart = async (req:Request, res:Response) => {
  const userId = req.user.user_id; // from auth middleware
  const { product_item_id, quantity } = req.body;
  const item = await service.addItem(userId, product_item_id, quantity);
  res.status(201).json(item);
};

export const getCart = async (req:Request, res:Response) => {
  const userId = req.user.user_id;
  const items = await service.listItems(userId);
  res.json(items);
};
