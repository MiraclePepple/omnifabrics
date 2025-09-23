import { Request, Response } from 'express';
import * as service from './product_item.service';

export const create = async (req:Request, res:Response) => {
  const item = await service.createProductItem(req.body);
  res.status(201).json(item);
};

export const list = async (req:Request, res:Response) => {
  const items = await service.getProductItems();
  res.json(items);
};
