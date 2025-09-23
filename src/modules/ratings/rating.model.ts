import { DataTypes } from 'sequelize';
import sequelize from '../../config/db';

export const Rating = sequelize.define('Rating', {
  rating_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  product_id: DataTypes.BIGINT,
  user_id: DataTypes.BIGINT,
  rating: DataTypes.INTEGER, // 1-5
  comment: DataTypes.TEXT,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, { tableName: 'Rating', timestamps: false });
