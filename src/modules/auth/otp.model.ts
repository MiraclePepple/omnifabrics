import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/db';

export class Otp extends Model {
  public otp_id!: number;
  public user_id!: number;
  public code!: string;
  public type!: 'password_recovery' | 'store_verification';
  public expires_at!: Date;
  public used!: boolean;
}

Otp.init(
  {
    otp_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    code: { type: DataTypes.STRING(6), allowNull: false },
    type: { type: DataTypes.ENUM('password_recovery','store_verification'), allowNull: false },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    used: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  {
    sequelize,
    tableName: 'otps',
    timestamps: false
  }
);
