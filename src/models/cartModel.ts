import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

export class Cart extends Model {
  public cart_id!: number;
  public user_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Cart.init(
  {
    cart_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "cart",
    timestamps: false,
  }
);
