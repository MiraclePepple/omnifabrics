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
  declare is_seller: boolean;
  declare is_active: boolean;
  declare is_suspended: boolean;
  declare profile_data: object | null;
  declare last_login_at: Date | null;
  declare created_at: Date;
  declare updated_at: Date;
  declare deleted_at: Date | null;
  declare gender: "Male" | "Female";
}

User.init(
  {
    user_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    first_name: { type: DataTypes.STRING(100), allowNull: false },
    last_name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    phone_number: { type: DataTypes.STRING(50), allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: false },
    state: { type: DataTypes.STRING(100) },
    city: { type: DataTypes.STRING(100) },
    country: { type: DataTypes.STRING(100) },
    address: { type: DataTypes.TEXT },
    is_seller: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    is_suspended: { type: DataTypes.BOOLEAN, defaultValue: false },
    profile_data: { type: DataTypes.JSON },
    last_login_at: { type: DataTypes.DATE },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    deleted_at: { type: DataTypes.DATE },
    gender: { type: DataTypes.ENUM("Male", "Female"), allowNull: false },
  },

  {
    sequelize,
    tableName: "users",
    timestamps: false, 
    paranoid: true,    // enables deleted_at for soft deletes
  }
);

// You can define associations here if needed
import { PasswordReset } from './passwordReset';
User.hasMany(PasswordReset, { foreignKey: 'user_id' });
