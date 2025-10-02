// src/modules/support/support.controller.ts
import { Request, Response } from 'express';
import SupportService from './support.service';

export default class SupportController {
  static async createTicket(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { message } = req.body;
      const ticket = await SupportService.createTicket(userId, message);
      res.status(201).json(ticket);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getMyTickets(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const tickets = await SupportService.getUserTickets(userId);
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getAllTickets(req: Request, res: Response) {
    try {
      const tickets = await SupportService.getAllTickets();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async resolveTicket(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ticket = await SupportService.resolveTicket(Number(id));
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
