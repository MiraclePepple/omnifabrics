// src/modules/payments/transaction.model.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/db';

export class Transaction extends Model {
  public transaction_id!: number;
  public order_id!: number | null;
  public user_id!: number;
  public amount!: number;
  public currency!: string;
  public provider_ref!: string | null;
  public provider_data!: any | null;
  public status!: 'pending' | 'paid' | 'failed' | 'refunded';
  public created_at!: Date;
  public updated_at!: Date;
}

Transaction.init(
  {
    transaction_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    currency: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'NGN' },
    provider_ref: { type: DataTypes.STRING(255), allowNull: true },
    provider_data: { type: DataTypes.JSON, allowNull: true },
    status: { type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'), defaultValue: 'pending' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'transactions',
    timestamps: false,
  }
);

export default Transaction;
