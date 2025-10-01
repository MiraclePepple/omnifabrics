import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/db';

export class AdminPermission extends Model {
  public admin_permission_id!: number;
  public admin_id!: number;
  public permission_id!: number;
  public granted!: boolean;
  public createdAt?: Date;
  public updatedAt?: Date;
}

AdminPermission.init(
  {
    admin_permission_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    admin_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    permission_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    granted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'admin_permission',
    timestamps: true,
    underscored: true,
  }
);

export default AdminPermission;
