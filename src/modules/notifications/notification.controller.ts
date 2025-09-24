import { Request, Response } from 'express';
import * as svc from './notification.service';

export const createNote = async (req:Request, res:Response) => {
  const n = await svc.createNotification(req.body);
  res.status(201).json(n);
};

export const listForUser = async (req:Request, res:Response) => {
  const u = (req.user!).user_id;
  const notes = await svc.listNotificationsForUser(u);
  res.json(notes);
};

export const markRead = async (req:Request, res:Response) => {
  const n = await svc.markAsRead(Number(req.params.id));
  res.json(n);
};
