import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../config/db';

export interface NotificationAttributes {
  id: number;
  userId?: number;   // optional because not all notifications are for users
  adminId?: number;  // add this for admins
  message: string;
  isRead: boolean;
  createdAt?: Date;
}

export interface NotificationCreationAttributes 
  extends Optional<NotificationAttributes, 'id' | 'isRead' | 'createdAt'> {}

class Notification 
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes {
  public id!: number;
  public userId?: number;
  public adminId?: number; // add this
  public message!: string;
  public isRead!: boolean;
  public readonly createdAt!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'user_id',
    },
    adminId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'admin_id',
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Notification',
    tableName: 'notification',
    timestamps: true,
    updatedAt: false,
  }
);

export default Notification;
export { Notification };
