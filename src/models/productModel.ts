import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

export class Product extends Model {
  public product_id!: number;
  public store_id!: number;
  public product_name!: string;
  public short_description?: string;
  public full_description?: string;
  public images?: object;
  public rating!: number;
  public comment?: string;
  public is_active!: boolean;
  public discount_rate!: number;
  public discount_start_date?: Date;
  public discount_end_date?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Product.init(
  {
    product_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    store_id: { type: DataTypes.BIGINT, allowNull: false },
    product_name: { type: DataTypes.STRING(255), allowNull: false },
    short_description: { type: DataTypes.STRING(500), allowNull: true },
    full_description: { type: DataTypes.TEXT, allowNull: true },
    images: { type: DataTypes.JSON, allowNull: true },
    rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0.0 },
    comment: { type: DataTypes.TEXT, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    discount_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.0 },
    discount_start_date: { type: DataTypes.DATE, allowNull: true },
    discount_end_date: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "products",
    timestamps: false,
  }
);
