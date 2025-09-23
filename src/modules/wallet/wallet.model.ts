import { DataTypes } from 'sequelize';
import sequelize from '../../config/db';

export const Wallet = sequelize.define('Wallet', {
  wallet_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  store_id: DataTypes.BIGINT,
  balance: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, { tableName: 'Wallet', timestamps: false });

export const Transaction = sequelize.define('Transaction', {
  transaction_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  wallet_id: DataTypes.BIGINT,
  amount: DataTypes.DECIMAL(12,2),
  type: DataTypes.STRING, // credit/debit/request
  status: DataTypes.STRING, // pending, approved, canceled
  description: DataTypes.TEXT,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, { tableName: 'Transactions', timestamps: false });
