import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/db';
import { ProductItem } from '../product_items/product_item.model';
import { Product } from '../products/product.model';

export class Cart extends Model {
  public cart_id!: number;
  public user_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public cart_items?: CartItem[];
}

Cart.init(
  {
    cart_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'cart',      // match your MySQL table name exactly
    timestamps: true,  
    underscored: true,      // snake_case in DB
  }
);


export class CartItem extends Model {
  public cart_item_id!: number;
  public cart_id!: number;
  public product_id!: number;
  public product_item_id!: number;
  public quantity!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public product?: Product;
  public product_variant?: ProductItem;
}

CartItem.init(
  {
    cart_item_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    cart_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    product_item_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'cart_item',   // match MySQL table
    timestamps: true,         
    underscored: true,
  }
);
