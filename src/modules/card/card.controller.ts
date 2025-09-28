import { Request, Response } from 'express';
import { Card } from './card.model';

export const getUserCards = async (req: Request, res: Response) => {
  try {
    const cards = await Card.findAll({ where: { user_id: req.body.userId } });
    res.json(cards);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteUserCard = async (req: Request, res: Response) => {
  try {
    await Card.destroy({ where: { card_id: req.params.cardId, user_id: req.body.userId } });
    res.json({ message: 'Card deleted successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
