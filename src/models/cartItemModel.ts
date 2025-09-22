import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

export class CartItem extends Model {
  public cart_item_id!: number;
  public cart_id!: number;
  public product_item_id!: number;
  public quantity!: number;
}

CartItem.init(
  {
    cart_item_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    cart_id: { type: DataTypes.BIGINT, allowNull: false },
    product_item_id: { type: DataTypes.BIGINT, allowNull: false },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  },
  {
    sequelize,
    tableName: "cart_items",
    timestamps: false,
  }
);
