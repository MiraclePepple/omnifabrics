import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/db';


export class ProductItem extends Model {
public product_item_id!: number;
public color!: string | null;
public quantity!: number | null;
public is_available!: boolean;
public price!: number | null;
}


ProductItem.init(
{
product_item_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
color: { type: DataTypes.STRING, allowNull: true },
quantity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
is_available: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
price: { type: DataTypes.DECIMAL(10, 2), allowNull: true }
},
{ sequelize, tableName: 'product_items', timestamps: false }
);