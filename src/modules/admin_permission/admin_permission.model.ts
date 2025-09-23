import { DataTypes } from 'sequelize';
import sequelize from '../../config/db';

export const AdminPermission = sequelize.define('AdminPermission', {
  admin_permission_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  admin_id: DataTypes.BIGINT,
  permission_id: DataTypes.BIGINT,
  granted: { type: DataTypes.BOOLEAN, defaultValue: true },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, { tableName: 'Admin_permission', timestamps: false });
