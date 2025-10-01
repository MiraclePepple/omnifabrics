import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/db';

export class Permission extends Model {
  public permission_id!: number;
  public name!: string;
  public description?: string;
  public createdAt?: Date;
  public updatedAt?: Date;
}

Permission.init(
  {
    permission_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'created_at',
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'permission',
    timestamps: true,
    underscored: true,
  }
);

export default Permission;
