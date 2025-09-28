// src/modules/card/card.model.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/db';
import { User } from '../users/user.model';

export class Card extends Model {
  declare card_id: number;
  declare user_id: number;
  declare card_token: string; // Flutterwave token
  declare last4: string; // last 4 digits of card
  declare card_type: string; // e.g. "visa"
  declare expiry_month: string;
  declare expiry_year: string;
  declare created_at: Date;
}

Card.init(
  {
    card_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    card_token: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    last4: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    card_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    expiry_month: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    expiry_year: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'cards',
    timestamps: false,
  }
);

