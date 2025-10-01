import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../config/db';

export interface PasswordResetAttributes {
  id: number;
  user_id: number; // admin id
  otp_code: string;
  otp_expires: Date;
  used?: boolean;
  created_at?: Date;
}

export type PasswordResetCreationAttributes = Optional<
  PasswordResetAttributes,
  'id' | 'used' | 'created_at'
>;

export class PasswordReset
  extends Model<PasswordResetAttributes, PasswordResetCreationAttributes>
  implements PasswordResetAttributes
{
  public id!: number;
  public user_id!: number;
  public otp_code!: string;
  public otp_expires!: Date;
  public used?: boolean;
  public created_at?: Date;
}

PasswordReset.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
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
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'password_resets',
    modelName: 'PasswordReset',
    timestamps: false,
    underscored: true,
  }
);

export default PasswordReset;
