import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class User extends Model {
  declare user_id: number;
  declare first_name: string;
  declare last_name: string;
  declare email: string;
  declare phone_number: string;
  declare password: string;
  declare state: string;
  declare city: string;
  declare country: string;
  declare address: string;
  declare role: "buyer" | "seller";
  declare is_seller: boolean;
  declare is_active: boolean;
  declare is_suspended: boolean;
  declare profile_data: object | null;
  declare last_login_at: Date | null;
  declare created_at: Date;
  declare updated_at: Date;
  declare deleted_at: Date | null;
}

User.init(
  {
    user_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    first_name: { type: DataTypes.STRING(100) },
    last_name: { type: DataTypes.STRING(100) },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    phone_number: { type: DataTypes.STRING(50) },
    password: { type: DataTypes.STRING(255), allowNull: false },
    state: { type: DataTypes.STRING(100) },
    city: { type: DataTypes.STRING(100) },
    country: { type: DataTypes.STRING(100) },
    address: { type: DataTypes.TEXT },
    role: { 
      type: DataTypes.ENUM("buyer", "seller"), 
      defaultValue: "buyer" 
    },
    is_seller: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    is_suspended: { type: DataTypes.BOOLEAN, defaultValue: false },
    profile_data: { type: DataTypes.JSON },
    last_login_at: { type: DataTypes.DATE },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    deleted_at: { type: DataTypes.DATE },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: false, 
    paranoid: true,    // enables deleted_at for soft deletes
  }
);
