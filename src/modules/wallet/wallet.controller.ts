import { Request, Response } from 'express';
import * as service from './wallet.service';

export const getWallet = async (req:Request, res:Response) => {
  const storeId = Number(req.params.storeId);
  const w = await service.getWalletForStore(storeId);
  res.json(w || { balance: 0 });
};

export const createTx = async (req:Request, res:Response) => {
  const { wallet_id, amount, type, description } = req.body;
  const tx = await service.createTransaction(wallet_id, amount, type, description);
  res.status(201).json(tx);
};
