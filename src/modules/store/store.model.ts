import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/db';


export class Store extends Model {
    public store_id!: number;
    public user_id!: number | null;
    public name!: string | null;
    public phone_number!: string | null;
    public description!: string | null;
    public is_active!: boolean;
    public available_product!: number | null;
    public number_of_sales!: number | null;
    public created_at!: Date;
    public updated_at!: Date;
    public deleted_at!: Date | null;
}


Store.init(
{
store_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
name: { type: DataTypes.STRING, allowNull: true, unique: true },
phone_number: { type: DataTypes.STRING, allowNull: true },
description: { type: DataTypes.TEXT, allowNull: true },
is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
available_product: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
number_of_sales: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
deleted_at: { type: DataTypes.DATE },
},
{ sequelize, tableName: 'stores', timestamps: false }
);


export default Store;