import { DataTypes } from 'sequelize';
import sequelize from '../../config/db';

export const Payment = sequelize.define('Payment', {
  pay_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  order_id: DataTypes.BIGINT,
  amount: DataTypes.DECIMAL(12,2),
  payment_method: DataTypes.STRING,
  payment_status: DataTypes.STRING,
  user_id: DataTypes.BIGINT,
  reference: DataTypes.STRING,
  paid_at: DataTypes.DATE,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, { tableName: 'Payment', timestamps: false });
