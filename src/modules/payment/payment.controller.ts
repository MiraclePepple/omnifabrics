// src/modules/payment/payment.controller.ts
import { Request, Response } from 'express';
import * as svc from './payment.service';

export const payForProduct = async (req: Request, res: Response) => {
  try {
    const result = await svc.payForProduct({
      userId: req.body.userId, // or req.user.id if using auth middleware
      productId: req.body.productId,
      fromCart: req.body.fromCart,
      card: {
        useSaved: req.body.card.useSaved,
        savedCardId: req.body.card.savedCardId,
        cardNumber: req.body.card.cardNumber,
        expiry: req.body.card.expiry,
        cvv: req.body.card.cvv,
        saveNew: req.body.card.saveNew,
      },
      delivery: {
        address: req.body.delivery?.address,
        phone: req.body.delivery?.phone,
      },
    });

    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
