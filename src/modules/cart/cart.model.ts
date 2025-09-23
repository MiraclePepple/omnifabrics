import { DataTypes } from 'sequelize';
import sequelize from '../../config/db';

export const Cart = sequelize.define('Cart', {
    cart_id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true,},
    user_id: {type: DataTypes.BIGINT, allowNull: false,},
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
}, 
{
  tableName: 'Cart',
  timestamps: false,
});

export const CartItem = sequelize.define('CartItem', {
  cart_item_id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true,},
  cart_id: {type: DataTypes.BIGINT,allowNull: false,},
  product_id: {type: DataTypes.BIGINT,allowNull: false,},
  product_item_id: {type: DataTypes.BIGINT,allowNull: false,},
  quantity: {type: DataTypes.INTEGER, allowNull: false,},
}, {
  tableName: 'Cart_Item',
  timestamps: false,
});
