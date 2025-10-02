import Notification from './notification.model';

export default class NotificationService {
  static async createNotification(userId: number, message: string) {
    return Notification.create({ userId, message });
  }

  static async getUserNotifications(userId: number) {
    return Notification.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
  }

  static async markAsRead(id: number) {
    const notification = await Notification.findByPk(id);
    if (!notification) throw new Error('Notification not found');
    notification.isRead = true;
    return notification.save();
  }
}
