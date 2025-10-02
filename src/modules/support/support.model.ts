import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../config/db';

export interface SupportAttributes {
  id: number;
  userId: number;
  message: string;
  status: 'open' | 'resolved';
  createdAt?: Date;
}

export interface SupportCreationAttributes extends Optional<SupportAttributes, 'id' | 'status' | 'createdAt'> {}

class Support extends Model<SupportAttributes, SupportCreationAttributes>
  implements SupportAttributes {
  public id!: number;
  public userId!: number;
  public message!: string;
  public status!: 'open' | 'resolved';
  public readonly createdAt!: Date;
}

Support.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('open', 'resolved'),
      defaultValue: 'open',
    },
  },
  {
    sequelize,
    modelName: 'Support',
    tableName: 'support_requests',
    timestamps: true,
    updatedAt: false,
  }
);

export default Support;
