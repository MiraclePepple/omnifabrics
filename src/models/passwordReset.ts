import { DataTypes, Model } from "sequelize";
import sequelize  from "../config/db"; // your sequelize instance

export class PasswordReset extends Model {
  public id!: number;
  public user_id!: number;
  public otp_code!: string;
  public otp_expires!: Date;
  public used!: boolean;
}

PasswordReset.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    otp_code: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    otp_expires: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "password_resets",
    timestamps: false,
  }
);

import { User } from './userModel';
PasswordReset.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(PasswordReset, { foreignKey: 'user_id' });