import { Notification } from './notification.model';

export const createNotification = async (data:any) => Notification.create({ ...data, created_at: new Date() });
export const listNotificationsForUser = async (userId:number) => Notification.findAll({ where: { user_id: userId }});
export const markAsRead = async (id:number) => {
  const notification = await Notification.findByPk(id);
  if (!notification) throw new Error('Notification not found');
  notification.set('read_at', new Date());
  await notification.save();
  return notification;
};
