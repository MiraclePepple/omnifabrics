import { DataTypes } from 'sequelize';
import sequelize from '../../config/db';

export const Permission = sequelize.define('Permission', {
  permission_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  description: DataTypes.TEXT
}, { tableName: 'Permission', timestamps: false });
