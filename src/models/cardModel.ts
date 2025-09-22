import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

export class Card extends Model {
  public card_id!: number;
  public user_id!: number;
  public card_number!: string;
  public card_name!: string;
  public expiry_month!: string;
  public expiry_year!: string;
  public cvv!: string;
}

Card.init(
  {
    card_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    card_number: { type: DataTypes.STRING(16), allowNull: false },
    card_name: { type: DataTypes.STRING, allowNull: false },
    expiry_month: { type: DataTypes.STRING(2), allowNull: false },
    expiry_year: { type: DataTypes.STRING(4), allowNull: false },
    cvv: { type: DataTypes.STRING(3), allowNull: false },
  },
  { sequelize, tableName: "cards", timestamps: false }
);
