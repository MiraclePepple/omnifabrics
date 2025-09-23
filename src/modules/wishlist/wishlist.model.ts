import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/db';

export class Wishlist extends Model {
  public wish_id!: number;
  public user_id!: number;
  public product_id!: number;
  public product_item_id!: number | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Wishlist.init({
  wish_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  product_id: DataTypes.BIGINT,
  user_id: DataTypes.BIGINT,
  product_item_id: DataTypes.BIGINT,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
    sequelize,
    tableName: 'Wishlist', 
    timestamps: false });




