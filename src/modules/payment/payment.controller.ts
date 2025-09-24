import { Request, Response } from 'express';
import * as svc from './payment.service';

export const initiate = async (req:Request, res:Response) => {
  const userId = req.user.user_id;
  const { order_id, amount, method } = req.body;
  const p = await svc.initiatePayment(userId, order_id, amount, method);
  // TODO: include gateway checkout payload
  res.status(201).json(p);
};

export const confirm = async (req:Request, res:Response) => {
  const { reference, status } = req.body;
  const p = await svc.confirmPayment(reference, status);
  res.json(p);
};
