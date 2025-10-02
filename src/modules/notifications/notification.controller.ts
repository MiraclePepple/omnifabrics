import { Request, Response } from 'express';
import NotificationService from './notification.service';

export default class NotificationController {
  static async getMyNotifications(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const notifications = await NotificationService.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const notification = await NotificationService.markAsRead(Number(id));
      res.json(notification);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
