import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/db';


export class Category extends Model {
public category_id!: number;
public category_name!: string;
public category_description!: string | null;
}


Category.init(
{
category_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
category_name: { type: DataTypes.STRING, allowNull: false },
category_description: { type: DataTypes.TEXT, allowNull: true }
},
{ sequelize, tableName: 'category', timestamps: false }
);


export default Category;