// src/modules/payments/payment.model.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/db";

export class Payment extends Model {
  public payment_id!: number;
  public order_id!: number;
  public user_id!: number;
  public amount!: number;
  public status!: "pending" | "successful" | "failed";
  public payment_reference!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Payment.init(
  {
    payment_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    status: { type: DataTypes.ENUM("pending","successful","failed"), defaultValue: "pending" },
    payment_reference: { type: DataTypes.STRING(255), allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "payment",
    timestamps: true,
    underscored: true,
  }
);
