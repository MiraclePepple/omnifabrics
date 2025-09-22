import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

export class ProductItem extends Model {
  public product_item_id!: number;
  public product_id!: number;
  public color?: string;
  public quantity!: number; // stock
  public is_available!: boolean;
  public price!: number;
}

ProductItem.init(
  {
    product_item_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    product_id: { type: DataTypes.BIGINT, allowNull: false },
    color: { type: DataTypes.STRING(50), allowNull: true },
    quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
    is_available: { type: DataTypes.BOOLEAN, defaultValue: true },
    price: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  },
  {
    sequelize,
    tableName: "product_items",
    timestamps: false,
  }
);
