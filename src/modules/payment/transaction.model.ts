// src/modules/payment/transaction.model.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/db";

export class Transaction extends Model {
  public transaction_id!: number;
  public order_id!: number;
  public user_id!: number;
  public amount!: number;
  public currency!: string;
  public status!: string;
  public provider_ref?: string;
  public provider_data?: object;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Transaction.init(
  {
    transaction_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    currency: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'NGN' },
    status: { type: DataTypes.STRING(20), allowNull: false },
    provider_ref: { type: DataTypes.STRING(100), allowNull: true },
    provider_data: { type: DataTypes.JSON, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  },
  {
    sequelize,
    tableName: "transactions",
    timestamps: false
  }
);
