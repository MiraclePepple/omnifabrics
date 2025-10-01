// src/modules/admin/admin.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../config/db';

export interface AdminAttributes {
  adminId: number;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  password: string;
  isSuperadmin?: boolean;
  isBlocked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AdminCreationAttributes = Optional<
  AdminAttributes,
  'adminId' | 'firstName' | 'lastName' | 'isSuperadmin' | 'isBlocked' | 'createdAt' | 'updatedAt'
>;

export class Admin
  extends Model<AdminAttributes, AdminCreationAttributes>
  implements AdminAttributes
{
  public adminId!: number;
  public firstName?: string | null;
  public lastName?: string | null;
  public email!: string;
  public password!: string;
  public isSuperadmin?: boolean;
  public isBlocked?: boolean;
  public createdAt?: Date;
  public updatedAt?: Date;
}

Admin.init(
  {
    adminId: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'admin_id',
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'first_name',
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'last_name',
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isSuperadmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_superadmin',
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_blocked',
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
    modelName: 'Admin',
    tableName: 'admin',
    timestamps: true,
    underscored: true,
  }
);

export default Admin;
