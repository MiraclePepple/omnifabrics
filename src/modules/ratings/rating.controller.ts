import { Request, Response } from 'express';
import * as service from './rating.service';

export const createRating = async (req:Request, res:Response) => {
  try {
    const userId = (req.user!).user_id;
    const data = await service.createRating(userId, req.body);
    res.status(201).json(data);
  } catch (err:any) {
    res.status(400).json({ error: err.message });
  }
};

export const listRatings = async (req:Request, res:Response) => {
  const rs = await service.getRatingsForProduct(Number(req.params.productId));
  res.json(rs);
};
