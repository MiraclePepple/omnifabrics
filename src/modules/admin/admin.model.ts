import { DataTypes } from 'sequelize';
import sequelize from '../../config/db';

export const Admin = sequelize.define('Admin', {
  admin_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  new_password: DataTypes.STRING,
  confirm_password: DataTypes.STRING,
  is_superadmin: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, { tableName: 'Admin', timestamps: false });
