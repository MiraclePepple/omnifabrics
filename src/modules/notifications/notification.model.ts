import { DataTypes } from 'sequelize';
import sequelize from '../../config/db';

export const Notification = sequelize.define('Notification', {
  notification_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  admin_id: DataTypes.BIGINT,
  user_id: DataTypes.BIGINT,
  title: DataTypes.STRING,
  message: DataTypes.TEXT,
  created_at: DataTypes.DATE,
  read_at: DataTypes.DATE
}, { tableName: 'Notification', timestamps: false });
