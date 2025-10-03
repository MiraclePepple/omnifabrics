// src/modules/wallet/wallet.model.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";

export interface WalletAttributes {
  wallet_id: number;
  store_id: number;
  balance: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface WalletCreationAttributes extends Optional<WalletAttributes, "wallet_id"> {}

export class Wallet extends Model<WalletAttributes, WalletCreationAttributes>
  implements WalletAttributes {
  public wallet_id!: number;
  public store_id!: number;
  public balance!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Wallet.init(
  {
    wallet_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    store_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    balance: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0.0,
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
    modelName: "Wallet",
    tableName: "wallet",
    timestamps: false,
  }
);

export default Wallet;
