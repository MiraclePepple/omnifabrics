import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

export class Wishlist extends Model {
  public wish_id!: number;
  public user_id!: number;
  public product_id!: number;
  public product_item_id!: number | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Wishlist.init(
  {
    wish_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    product_id: { type: DataTypes.BIGINT, allowNull: false },
    product_item_id: { type: DataTypes.BIGINT, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "wishlist",
    timestamps: false,
  }
);
