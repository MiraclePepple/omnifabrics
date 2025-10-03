// src/modules/payment/transaction.model.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
import { User } from "../users/user.model";
import { Order} from "../orders/order.model";
import { Store } from "../store/store.model";

export interface TransactionAttributes {
  transaction_id: number;
  order_id: number;
  user_id: number;
  amount: number;
  currency?: string;
  status?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface TransactionCreationAttributes
  extends Optional<TransactionAttributes, "transaction_id" | "currency" | "status"> {}

class Transaction
  extends Model<TransactionAttributes, TransactionCreationAttributes>
  implements TransactionAttributes {
  public transaction_id!: number;
  public order_id!: number;
  public user_id!: number;
  public amount!: number;
  public currency?: string;
  public status?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Transaction.init(
  {
    transaction_id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: "NGN",
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: "pending",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Transaction",
    tableName: "transactions",
    timestamps: false,
  }
);

// ✅ Associations


export default Transaction;
